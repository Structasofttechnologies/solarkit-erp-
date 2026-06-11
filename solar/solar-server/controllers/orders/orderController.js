import Order from '../../models/orders/Order.js';
import Product from '../../models/inventory/Product.js';

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  return `ORD-${Date.now()}-${count + 1}`;
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, user, state, cluster, district, category, timeline, startDate, endDate, year, quarter } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (user) filter.user = user;
    if (state) filter['customer.state'] = state;
    if (cluster) filter['customer.cluster'] = cluster;
    if (district) filter['customer.district'] = district;
    if (category) filter.category = category;
    
    // Date Range Logic
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    } else if (year) {
      if (quarter) {
        const qMap = {
          'Q1': { start: '-01-01', end: '-03-31' },
          'Q2': { start: '-04-01', end: '-06-30' },
          'Q3': { start: '-07-01', end: '-09-30' },
          'Q4': { start: '-10-01', end: '-12-31' }
        };
        if (qMap[quarter]) {
          filter.createdAt = {
            $gte: new Date(year + qMap[quarter].start),
            $lte: new Date(year + qMap[quarter].end + 'T23:59:59')
          };
        }
      } else {
        // Show all for the year
        filter.createdAt = {
          $gte: new Date(year + '-01-01'),
          $lte: new Date(year + '-12-31T23:59:59')
        };
      }
    } else if (timeline) {
      filter.timeline = timeline;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone partnerType')
      .populate('items.product', 'name sku price')
      .populate('customer.state', 'name')
      .populate('customer.cluster', 'name')
      .populate('customer.district', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      user,
      customer,
      items,
      subTotal,
      tax,
      shippingCost,
      discount,
      paymentMethod,
      category,
      subCategory,
      projectType,
      timeline,
    } = req.body;

    let totalAmount = subTotal + (tax || 0) + (shippingCost || 0) - (discount || 0);

    const order = new Order({
      orderNumber: await generateOrderNumber(),
      user,
      customer,
      items,
      subTotal,
      tax: tax || 0,
      shippingCost: shippingCost || 0,
      discount: discount || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'bank_transfer',
      category,
      subCategory,
      projectType,
      timeline,
    });

    if (paymentMethod === 'loan') {
      order.milestones = [
        { name: 'Advance Payment', status: 'pending' },
        { name: 'Structure Completion', status: 'pending' },
        { name: 'Installation Completion', status: 'pending' },
        { name: 'Net Metering Completion', status: 'pending' }
      ];
    }

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    Object.assign(order, req.body);
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const count = await Order.countDocuments({ invoiceNumber: { $exists: true } });
  return `INV/${year}${month}/${(count + 1).toString().padStart(4, '0')}`;
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Milestone Dependency Check for Loans
    if (order.paymentMethod === 'loan' && status !== order.status) {
      const milestoneMap = {
        'processing': 'Advance Payment',
        'shipped': 'Structure Completion',
        'delivered': 'Installation Completion',
        'completed': 'Net Metering Completion'
      };

      const requiredMilestoneName = milestoneMap[status];
      if (requiredMilestoneName) {
        const milestoneIndex = order.milestones.findIndex(m => m.name === requiredMilestoneName);
        
        // Ensure all milestones up to (and including) this one are completed if we are moving TO this status
        // OR: Ensure all milestones BEFORE this one are completed.
        // Usually: "Processing" means "In Progress", so "Advance" must be DONE.
        if (milestoneIndex !== -1) {
          const previousMilestones = order.milestones.slice(0, milestoneIndex + 1);
          const incomplete = previousMilestones.filter(m => m.status !== 'completed');
          
          if (incomplete.length > 0) {
            return res.status(400).json({ 
              success: false,
              message: `Milestone Required: [${incomplete.map(i => i.name).join(', ')}] must be completed before moving to ${status}.` 
            });
          }
        }
      }
    }

    order.status = status;

    // Auto-generate invoice when confirmed
    if (status === 'confirmed' && !order.invoiceNumber) {
      order.invoiceNumber = await generateInvoiceNumber();
      order.invoiceDate = new Date();
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { state, cluster, district, startDate, endDate, year, quarter } = req.query;
    let matchFilter = {};
    if (state) matchFilter['customer.state'] = new mongoose.Types.ObjectId(state);
    if (cluster) matchFilter['customer.cluster'] = new mongoose.Types.ObjectId(cluster);
    if (district) matchFilter['customer.district'] = new mongoose.Types.ObjectId(district);
    
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    } else if (year) {
      if (quarter) {
        const qMap = {
          'Q1': { start: '-01-01', end: '-03-31' },
          'Q2': { start: '-04-01', end: '-06-30' },
          'Q3': { start: '-07-01', end: '-09-30' },
          'Q4': { start: '-10-01', end: '-12-31' }
        };
        if (qMap[quarter]) {
          matchFilter.createdAt = {
            $gte: new Date(year + qMap[quarter].start),
            $lte: new Date(year + qMap[quarter].end + 'T23:59:59')
          };
        }
      } else {
        matchFilter.createdAt = {
          $gte: new Date(year + '-01-01'),
          $lte: new Date(year + '-12-31T23:59:59')
        };
      }
    }

    const totalOrders = await Order.countDocuments(matchFilter);
    const pendingOrders = await Order.countDocuments({ ...matchFilter, status: 'pending' });
    const completedOrders = await Order.countDocuments({ ...matchFilter, status: 'delivered' });

    const revenueMatch = { ...matchFilter, status: 'delivered' };
    const totalRevenue = await Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku price hsnCode')
      .populate('customer.state', 'name')
      .populate('customer.district', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.invoiceNumber) {
      return res.status(400).json({ message: 'Invoice not generated for this order yet.' });
    }

    const companyName = "SOLARKITS ERP SYSTEM";
    const companyAddress = "123 Solar Street, Green Energy Park, India";
    const companyGstin = "24AAAAA0000A1Z5";
    const logoUrl = "https://cdn-icons-png.flaticon.com/512/3222/3222800.png"; // Placeholder logo

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.invoiceNumber}</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 40px; background: #f4f7f6; }
          .invoice-box { max-width: 850px; margin: auto; padding: 40px; border: 1px solid #eee; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-radius: 12px; }
          .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
          .logo { height: 60px; filter: grayscale(1); }
          .company-info h1 { margin: 0; font-size: 24px; color: #0b386a; }
          .company-info p { margin: 2px 0; font-size: 12px; color: #666; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0; color: #0b386a; font-size: 32px; font-weight: 900; }
          .invoice-details p { margin: 2px 0; font-size: 13px; font-weight: bold; }
          
          .billing-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .bill-to h3 { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
          .bill-to p { margin: 2px 0; font-size: 14px; }
          .bill-to .name { font-weight: bold; font-size: 16px; color: #111; }

          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-bottom: 40px; }
          table th { background: #f9fafb; padding: 12px 15px; border-bottom: 2px solid #eee; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
          table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 13px; }
          table tr.item:last-child td { border-bottom: none; }
          
          .totals { margin-left: auto; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.grand-total { border-top: 2px solid #0b386a; margin-top: 10px; padding-top: 15px; font-weight: 900; font-size: 18px; color: #0b386a; }
          
          .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
          .gst-note { font-size: 10px; font-style: italic; color: #888; margin-top: 20px; }
          
          @media print {
            body { background: #fff; padding: 0; }
            .invoice-box { box-shadow: none; border: none; padding: 0; }
            .no-print { display: none; }
          }
          .print-btn { background: #0b386a; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; }
        </style>
      </head>
      <body>
        <div style="text-align: center;" class="no-print">
          <button class="print-btn" onclick="window.print()">Print Invoice</button>
        </div>
        <div class="invoice-box">
          <div class="header">
            <div class="company-info">
              <img src="${logoUrl}" class="logo" />
              <h1>${companyName}</h1>
              <p>${companyAddress}</p>
              <p>GSTIN: <strong>${companyGstin}</strong></p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p>Invoice #: ${order.invoiceNumber}</p>
              <p>Date: ${new Date(order.invoiceDate).toLocaleDateString()}</p>
              <p>Order #: ${order.orderNumber}</p>
            </div>
          </div>

          <div class="billing-grid">
            <div class="bill-to">
              <h3>Bill To</h3>
              <p class="name">${order.customer.name}</p>
              <p>${order.customer.address}</p>
              <p>${order.customer.district?.name || ''}, ${order.customer.state?.name || ''}</p>
              <p>Phone: ${order.customer.phone}</p>
              <p>Email: ${order.customer.email}</p>
            </div>
            <div class="bill-to">
              <h3>Payment Status</h3>
              <p><strong style="color: ${order.paymentStatus === 'paid' ? 'green' : 'orange'}">${order.paymentStatus.toUpperCase()}</strong></p>
              <p>Method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, index) => `
                <tr class="item">
                  <td>${index + 1}</td>
                  <td>
                    <strong>${item.product?.name || 'Solar Product'}</strong><br/>
                    <small style="color: #888">SKU: ${item.product?.sku || 'N/A'}</small>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
                  <td style="text-align: right;">₹${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${order.subTotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>GST (Included)</span>
              <span>₹${order.tax.toLocaleString()}</span>
            </div>
            ${order.discount > 0 ? `
              <div class="total-row" style="color: red;">
                <span>Discount</span>
                <span>-₹${order.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span>Grand Total</span>
              <span>₹${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div class="gst-note">
            Note: This is a computer generated invoice and does not require a physical signature.
            Tax is calculated based on ${order.customer.state?.name || 'Customer Location'}.
          </div>

          <div class="footer">
            Thank you for choosing ${companyName} for your solar needs.<br/>
            For any queries, contact support@solarkits.com or call +91-9876543210.
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderMilestone = async (req, res) => {
  try {
    const { milestoneName, status, paymentConfirmed } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const milestoneIndex = order.milestones.findIndex(m => m.name === milestoneName);
    if (milestoneIndex === -1) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Dependency check: Cannot complete this milestone if previous one is not completed
    if (status === 'completed' && milestoneIndex > 0) {
      const prevMilestone = order.milestones[milestoneIndex - 1];
      if (prevMilestone.status !== 'completed') {
        return res.status(400).json({ 
          message: `Cannot complete ${milestoneName}. Previous milestone "${prevMilestone.name}" must be completed first.` 
        });
      }
    }

    order.milestones[milestoneIndex].status = status || order.milestones[milestoneIndex].status;
    if (status === 'completed') {
      order.milestones[milestoneIndex].completedAt = new Date();
    }
    
    if (paymentConfirmed !== undefined) {
      order.milestones[milestoneIndex].paymentConfirmed = paymentConfirmed;
    }

    await order.save();
    res.status(200).json({ success: true, message: 'Milestone updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
