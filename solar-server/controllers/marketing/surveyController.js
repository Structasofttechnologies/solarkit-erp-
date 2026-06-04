
import Survey from '../../models/marketing/Survey.js';
import Lead from '../../models/marketing/Lead.js';

// Get survey by Lead ID
export const getSurveyByLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        let survey = await Survey.findOne({ lead: leadId });

        if (!survey) {
            // Optional: Auto-create a pending survey if not exists when fetching
            // OR just return null/404. For now, let's return null and handle in frontend or create on "Start Survey"
            return res.status(200).json({ success: true, data: null });
        }

        res.status(200).json({ success: true, data: survey });
    } catch (error) {
        console.error('Error fetching survey:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create or Update Survey
export const createOrUpdateSurvey = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { details, siteImages, notes, status } = req.body;
        const dealerId = req.user.id;

        // Check if lead exists
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        let survey = await Survey.findOne({ lead: leadId });

        if (survey) {
            // Update
            survey.details = details || survey.details;
            survey.siteImages = siteImages || survey.siteImages;
            survey.notes = notes || survey.notes;
            if (status) survey.status = status;
            await survey.save();
        } else {
            // Create
            survey = await Survey.create({
                lead: leadId,
                dealer: dealerId,
                status: status || 'Pending',
                details: details || {},
                siteImages: siteImages || [],
                notes: notes || ''
            });

            // Should we update Lead status to 'SurveyPending' if it was 'New'?
            if (lead.status === 'New') {
                lead.status = 'SurveyPending';
                await lead.save();
            }
        }

        // If status is specifically set to completed in this call
        if (status === 'Completed') {
            lead.status = 'SurveyCompleted';
            await lead.save();
        }

        res.status(200).json({ success: true, data: survey });

    } catch (error) {
        console.error('Error saving survey:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Mark Survey as Completed
export const completeSurvey = async (req, res) => {
    try {
        const { leadId } = req.params;
        const dealerId = req.user.id;

        let survey = await Survey.findOne({ lead: leadId });

        if (!survey) {
            // Create if not exists
            survey = await Survey.create({
                lead: leadId,
                dealer: dealerId,
                status: 'Completed',
                details: {},
                siteImages: [],
                notes: 'Completed directly'
            });
        } else {
            survey.status = 'Completed';
            await survey.save();
        }

        // Update Lead status
        const lead = await Lead.findById(leadId);
        if (lead) {
            lead.status = 'SurveyCompleted';
            await lead.save();
        }

        res.status(200).json({ success: true, message: 'Survey completed and Lead updated', data: survey });

    } catch (error) {
        console.error('Error completing survey:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
