import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { locationAPI, companyUserCreateAPI } from '../../../../api/api';

const emptyForm = {
  name: '',
  phoneNumber: '',
  email: '',
  role: 'company_user',

  subDistrictId: '',
  villageId: '',

  partnerGoal: {
    monthlyTargetKW: '',
    perKWCommission: '',
    partnerTypesCanCreate: '',
    numberOfPartnerFilled: '',
  },

  projectType: {
    monthlyTargetKW: '',
    perKWCommission: '',
    partnerTypesCanCreate: '',
    numberOfPartnerFilled: '',
  },

  quotePermissions: {
    canCreateQuote: false,
    canEditQuote: false,
    canDeleteQuote: false,
  },

  deadlineDate: '',
};

const toId = val => (val && typeof val === 'object' ? val._id : val);

export default function AppSetting() {
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    clusters: [],
    zones: [],
    districts: [],
    cities: [],
  });

  const [selectedLocation, setSelectedLocation] = useState({
    country: '',
    state: '',
    cluster: '',
    zone: '',
    district: '',
    city: '',
  });

  const [showLocationCards, setShowLocationCards] = useState(true);

  const [assignPartnerGoal, setAssignPartnerGoal] = useState(false);
  const [assignProjectGoal, setAssignProjectGoal] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await companyUserCreateAPI.getAllCompanyUser();
      setUsers(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load company users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryRes = await locationAPI.getAllCountries({ isActive: true });
        setLocationData(prev => ({
          ...prev,
          countries: countryRes.data?.data || [],
        }));
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const params = { isActive: true };

        if (selectedLocation.country) {
          params.countryId = selectedLocation.country;
        }

        const res = await locationAPI.getAllStates(params);

        setLocationData(prev => ({
          ...prev,
          states: res.data?.data || [],
          clusters: [],
          districts: [],
        }));
      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    };

    if (selectedLocation.country) fetchStates();
  }, [selectedLocation.country]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const params = { isActive: true };

        if (selectedLocation.district) {
          params.districtId = selectedLocation.district;
        } else if (selectedLocation.state) {
          params.stateId = selectedLocation.state;
        }

        const res = await locationAPI.getAllClusters(params);

        setLocationData(prev => ({
          ...prev,
          clusters: res.data?.data || [],
          zones: [],
        }));
      } catch (error) {
        console.error('Failed to fetch clusters:', error);
      }
    };

    if (selectedLocation.district || selectedLocation.state) fetchClusters();
  }, [selectedLocation.district, selectedLocation.state]);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        if (selectedLocation.cluster) {
          const res = await locationAPI.getAllZones({
            clusterId: selectedLocation.cluster,
            isActive: true
          });

          setLocationData(prev => ({
            ...prev,
            zones: res.data?.data || [],
            districts: [],
            cities: [],
          }));
        }
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      }
    };

    if (selectedLocation.cluster) fetchZones();
  }, [selectedLocation.cluster]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        // Prefer cluster scoped districts, fallback to state scoped
        if (selectedLocation.cluster) {
          const res = await locationAPI.getAllDistricts({
            clusterId: selectedLocation.cluster,
            isActive: true,
          });
          setLocationData(prev => ({
            ...prev,
            districts: res.data?.data || [],
            cities: [],
          }));
        } else if (selectedLocation.state) {
          const res = await locationAPI.getAllDistricts({
            stateId: selectedLocation.state,
            isActive: true,
          });
          setLocationData(prev => ({
            ...prev,
            districts: res.data?.data || [],
            cities: [],
          }));
        }
      } catch (error) {
        console.error('Failed to fetch districts:', error);
      }
    };

    if (selectedLocation.cluster || selectedLocation.state) fetchDistricts();
  }, [selectedLocation.cluster, selectedLocation.state]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        if (selectedLocation.district) {
          const res = await locationAPI.getAllCities({
            districtId: selectedLocation.district,
            isActive: true
          });

          setLocationData(prev => ({
            ...prev,
            cities: res.data?.data || [],
          }));
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };

    if (selectedLocation.district) fetchCities();
  }, [selectedLocation.district]);

  const handleChange = e => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleQuotePermissionChange = field => {
    setForm(prev => ({
      ...prev,
      quotePermissions: {
        ...prev.quotePermissions,
        [field]: !prev.quotePermissions[field],
      },
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setAssignPartnerGoal(false);
    setAssignProjectGoal(false);
    setSelectedLocation({
      country: '',
      state: '',
      cluster: '',
      zone: '',
      district: '',
      city: '',
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.phoneNumber ||
      !selectedLocation.country ||
      !selectedLocation.state ||
      !selectedLocation.cluster ||
      !selectedLocation.district
    ) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
      uniqueId: editId || `CU-${Date.now()}`,

      name: form.name,
      email: form.email,
      phoneNumber: form.phoneNumber,
      role: form.role,

      countryId: selectedLocation.country,
      stateId: selectedLocation.state,
      clusterId: selectedLocation.cluster,
      districtId: selectedLocation.district,

      // temporary fallback because backend schema requires these
      subDistrictId: selectedLocation.zone || form.subDistrictId || selectedLocation.district,
      villageId: selectedLocation.city || form.villageId || selectedLocation.district,

      assignPartnerGoal,
      assignProjectGoal,

      partnerGoal: {
        monthlyTargetKW: Number(form.partnerGoal.monthlyTargetKW) || 0,
        perKWCommission: Number(form.partnerGoal.perKWCommission) || 0,
        partnerTypesCanCreate: form.partnerGoal.partnerTypesCanCreate || undefined,
        numberOfPartnerFilled: Number(form.partnerGoal.numberOfPartnerFilled) || 0,
      },

      projectType: {
        monthlyTargetKW: Number(form.projectType.monthlyTargetKW) || 0,
        perKWCommission: Number(form.projectType.perKWCommission) || 0,
        partnerTypesCanCreate: form.projectType.partnerTypesCanCreate || undefined,
        numberOfPartnerFilled: Number(form.projectType.numberOfPartnerFilled) || 0,
      },

      quotePermissions: form.quotePermissions,
      deadlineDate: form.deadlineDate || undefined,
    };

    try {
      setLoading(true);

      if (editId) {
        await companyUserCreateAPI.updateCompanyUser(editId, payload);
        alert('Company user updated successfully');
      } else {
        await companyUserCreateAPI.createCompanyUser(payload);
        alert('Company user created successfully');
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = user => {
    setEditId(user._id);

    setForm({
      ...emptyForm,
      name: user.name || '',
      phoneNumber: user.phoneNumber || '',
      email: user.email || '',
      role: user.role || 'company_user',

      subDistrictId: toId(user.subDistrictId) || '',
      villageId: toId(user.villageId) || '',

      partnerGoal: {
        monthlyTargetKW: user.partnerGoal?.monthlyTargetKW || '',
        perKWCommission: user.partnerGoal?.perKWCommission || '',
        partnerTypesCanCreate: toId(user.partnerGoal?.partnerTypesCanCreate) || '',
        numberOfPartnerFilled: user.partnerGoal?.numberOfPartnerFilled || '',
      },

      projectType: {
        monthlyTargetKW: user.projectType?.monthlyTargetKW || '',
        perKWCommission: user.projectType?.perKWCommission || '',
        partnerTypesCanCreate: toId(user.projectType?.partnerTypesCanCreate) || '',
        numberOfPartnerFilled: user.projectType?.numberOfPartnerFilled || '',
      },

      quotePermissions: {
        canCreateQuote: user.quotePermissions?.canCreateQuote || false,
        canEditQuote: user.quotePermissions?.canEditQuote || false,
        canDeleteQuote: user.quotePermissions?.canDeleteQuote || false,
      },

      deadlineDate: user.deadlineDate ? user.deadlineDate.slice(0, 10) : '',
    });

    setAssignPartnerGoal(user.assignPartnerGoal || false);
    setAssignProjectGoal(user.assignProjectGoal || false);

    setSelectedLocation({
      country: toId(user.countryId) || '',
      state: toId(user.stateId) || '',
      cluster: toId(user.clusterId) || '',
      zone: toId(user.subDistrictId) || '',
      district: toId(user.districtId) || '',
      city: toId(user.villageId) || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await companyUserCreateAPI.deleteCompanyUser(id);
      alert('Company user deleted successfully');
      await loadUsers();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-[#1b62a6] transition-all"></div>
      <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-7"></div>
    </label>
  );

  const LocationCard = ({ title, subtitle, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${isSelected
        ? 'bg-[#82c5fa] border-blue-400 shadow-md text-gray-900'
        : 'bg-white border-gray-200 hover:border-[#82c5fa] hover:shadow-sm text-gray-800'
        }`}
    >
      <div className="font-bold mb-1">{title}</div>
      <div className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
        {subtitle}
      </div>
    </div>
  );

  return (
    <div className="p-4 relative">
      <div className="mb-4">
        <nav className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl mb-2 text-[#0b386a]">
              App Setting Location Hierarchy
            </h3>

            <button
              type="button"
              onClick={() => setShowLocationCards(!showLocationCards)}
              className="text-sm bg-[#1b62a6] hover:bg-[#144d85] text-white px-3 py-1.5 rounded-md flex items-center gap-2"
            >
              {showLocationCards ? (
                <>
                  <EyeOff size={16} /> Hide Location Cards
                </>
              ) : (
                <>
                  <Eye size={16} /> Show Location Cards
                </>
              )}
            </button>
          </div>
        </nav>
      </div>

      {showLocationCards && (
        <div className="mb-6 space-y-6">
          <div>
            <h4 className="font-bold text-lg mb-3 text-[#0b386a]">Select Country</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {locationData.countries.map(c => (
                <LocationCard
                  key={c._id}
                  title={c.name}
                  subtitle={c.code || c.name?.substring(0, 2).toUpperCase()}
                  isSelected={selectedLocation.country === c._id}
                  onClick={() =>
                    setSelectedLocation({
                      country: c._id,
                      state: '',
                      cluster: '',
                      district: '',
                    })
                  }
                />
              ))}
            </div>
          </div>

          {selectedLocation.country && (
            <div>
              <h4 className="font-bold text-lg mb-3 text-[#0b386a]">Select State</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {locationData.states.map(s => (
                  <LocationCard
                    key={s._id}
                    title={s.name}
                    subtitle={s.code || s.name?.substring(0, 2).toUpperCase()}
                    isSelected={selectedLocation.state === s._id}
                    onClick={() =>
                      setSelectedLocation(prev => ({
                        ...prev,
                        state: s._id,
                        cluster: '',
                        district: '',
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {selectedLocation.state && (
            <div>
              <h4 className="font-bold text-lg mb-3 text-[#0b386a]">Select District</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {locationData.districts.map(d => (
                  <LocationCard
                    key={d._id}
                    title={d.name}
                    subtitle="District"
                    isSelected={selectedLocation.district === d._id}
                    onClick={() =>
                      setSelectedLocation(prev => ({
                        ...prev,
                        district: d._id,
                        cluster: '',
                        zone: '',
                        city: '',
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )}





          {selectedLocation.district && (
            <div>
              <h4 className="font-bold text-lg mb-3 text-[#0b386a]">Select Cluster</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {locationData.clusters.map(c => (
                  <LocationCard
                    key={c._id}
                    title={c.name}
                    subtitle="Cluster"
                    isSelected={selectedLocation.cluster === c._id}
                    onClick={() =>
                      setSelectedLocation(prev => ({
                        ...prev,
                        cluster: c._id,
                        zone: '',
                        city: '',
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )}






          {selectedLocation.zone && (
            <div>
              <h4 className="font-bold text-lg mb-3 text-[#0b386a]">Select City / Village</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {locationData.cities.map(c => (
                  <LocationCard
                    key={c._id}
                    title={c.name}
                    subtitle="City"
                    isSelected={selectedLocation.city === c._id}
                    onClick={() =>
                      setSelectedLocation(prev => ({
                        ...prev,
                        city: c._id,
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )






          }

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-xl font-bold text-[#0b386a] mb-5">
              {editId ? 'Update Company User' : 'Create Company User'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h4 className="font-semibold text-[#1b62a6] mb-3">Personal Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Name"
                  />

                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Mobile Number"
                  />

                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Email Address"
                  />

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="company_user">Company User</option>
                    <option value="partner_user">Partner User</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </section>

              <section>
                <h4 className="font-semibold text-[#1b62a6] mb-3">
                  Goal Assign Permissions
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-800">Assign Partner Goal</h5>
                      <p className="text-sm text-gray-500">
                        Enable partner target and commission settings
                      </p>
                    </div>

                    <ToggleSwitch
                      checked={assignPartnerGoal}
                      onChange={() => setAssignPartnerGoal(!assignPartnerGoal)}
                    />
                  </div>

                  <div className="border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-800">Assign Project Goal</h5>
                      <p className="text-sm text-gray-500">
                        Enable project target and commission settings
                      </p>
                    </div>

                    <ToggleSwitch
                      checked={assignProjectGoal}
                      onChange={() => setAssignProjectGoal(!assignProjectGoal)}
                    />
                  </div>
                </div>
              </section>

              {assignPartnerGoal && (
                <section>
                  <h4 className="font-semibold text-[#1b62a6] mb-3">Partner Goal</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="number"
                      value={form.partnerGoal.monthlyTargetKW}
                      onChange={e =>
                        handleNestedChange('partnerGoal', 'monthlyTargetKW', e.target.value)
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Monthly Target KW"
                    />

                    <input
                      type="number"
                      value={form.partnerGoal.perKWCommission}
                      onChange={e =>
                        handleNestedChange('partnerGoal', 'perKWCommission', e.target.value)
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Per KW Commission"
                    />

                    <input
                      value={form.partnerGoal.partnerTypesCanCreate}
                      onChange={e =>
                        handleNestedChange(
                          'partnerGoal',
                          'partnerTypesCanCreate',
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Partner Type ID"
                    />

                    <input
                      type="number"
                      value={form.partnerGoal.numberOfPartnerFilled}
                      onChange={e =>
                        handleNestedChange(
                          'partnerGoal',
                          'numberOfPartnerFilled',
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Number of Partner Filled"
                    />
                  </div>
                </section>
              )}

              {assignProjectGoal && (
                <section>
                  <h4 className="font-semibold text-[#1b62a6] mb-3">Project Goal</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="number"
                      value={form.projectType.monthlyTargetKW}
                      onChange={e =>
                        handleNestedChange('projectType', 'monthlyTargetKW', e.target.value)
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Monthly Target KW"
                    />

                    <input
                      type="number"
                      value={form.projectType.perKWCommission}
                      onChange={e =>
                        handleNestedChange('projectType', 'perKWCommission', e.target.value)
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Per KW Commission"
                    />

                    <input
                      value={form.projectType.partnerTypesCanCreate}
                      onChange={e =>
                        handleNestedChange(
                          'projectType',
                          'partnerTypesCanCreate',
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Partner Type ID"
                    />

                    <input
                      type="number"
                      value={form.projectType.numberOfPartnerFilled}
                      onChange={e =>
                        handleNestedChange(
                          'projectType',
                          'numberOfPartnerFilled',
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                      placeholder="Number of Partner Filled"
                    />
                  </div>
                </section>
              )}

              <section>
                <h4 className="font-semibold text-[#1b62a6] mb-3">Deadline</h4>

                <input
                  name="deadlineDate"
                  value={form.deadlineDate}
                  onChange={handleChange}
                  type="date"
                  className="border rounded-lg px-3 py-2 w-full md:w-1/3"
                />
              </section>

              <section>
                <h4 className="font-semibold text-[#1b62a6] mb-3">Quote Permissions</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.quotePermissions.canCreateQuote}
                      onChange={() => handleQuotePermissionChange('canCreateQuote')}
                    />
                    <span>Quote Create</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.quotePermissions.canEditQuote}
                      onChange={() => handleQuotePermissionChange('canEditQuote')}
                    />
                    <span>Quote Edit</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.quotePermissions.canDeleteQuote}
                      onChange={() => handleQuotePermissionChange('canDeleteQuote')}
                    />
                    <span>Quote Delete</span>
                  </label>
                </div>
              </section>

              <div className="flex justify-end gap-3">
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2.5 rounded-lg"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1b62a6] hover:bg-[#144d85] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm"
                >
                  {loading
                    ? 'Saving...'
                    : editId
                      ? 'Update Company User'
                      : 'Create Company User'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-xl font-bold text-[#0b386a] mb-4">
              All Company Users Details
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-[#eef6ff] text-[#0b386a]">
                  <tr>
                    <th className="border px-3 py-2 text-left">Name</th>
                    <th className="border px-3 py-2 text-left">Mobile</th>
                    <th className="border px-3 py-2 text-left">Email</th>
                    <th className="border px-3 py-2 text-left">State</th>
                    <th className="border px-3 py-2 text-left">District</th>
                    <th className="border px-3 py-2 text-left">Partner Goal</th>
                    <th className="border px-3 py-2 text-left">Project Goal</th>
                    <th className="border px-3 py-2 text-left">Deadline</th>
                    <th className="border px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="border px-3 py-6 text-center text-gray-500">
                        No company users found
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td className="border px-3 py-2">{user.name}</td>
                        <td className="border px-3 py-2">{user.phoneNumber}</td>
                        <td className="border px-3 py-2">{user.email}</td>
                        <td className="border px-3 py-2">{user.stateId?.name || '-'}</td>
                        <td className="border px-3 py-2">{user.districtId?.name || '-'}</td>
                        <td className="border px-3 py-2">
                          {user.assignPartnerGoal ? 'Assigned' : 'Not Assigned'}
                        </td>
                        <td className="border px-3 py-2">
                          {user.assignProjectGoal ? 'Assigned' : 'Not Assigned'}
                        </td>
                        <td className="border px-3 py-2">
                          {user.deadlineDate ? user.deadlineDate.slice(0, 10) : '-'}
                        </td>

                        <td className="border px-3 py-2">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-all"
                              title="Edit User"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(user._id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-all"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}