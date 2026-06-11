// FranchiseMyTeam.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Phone,
    Mail,
    User,
    Plus,
    Shield,
    FileText,
    CreditCard,
    PenSquare,
    Settings,
    Award
} from 'lucide-react';
import { locationAPI } from '../../../api/api';

const FranchiseMyTeam = () => {
    const navigate = useNavigate();
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [districts, setDistricts] = useState([]);

    // Sample team data (Restored mock data for now)
    const [teamMembers] = useState([
        {
            id: 1,
            name: 'Rajesh Kumar',
            phone: '+91 876543210',
            email: 'rajesh.kumar@example.com',
            role: 'Project Manager',
            district: 'rajkot',
            image: 'https://cdn-icons-png.flaticon.com/512/219/219970.png',
            permissions: [
                { name: 'District Manager', color: 'blue' },
                { name: 'Survey BOM', color: 'cyan' },
                { name: 'Account', color: 'green' },
                { name: 'Project Signup', color: 'yellow' },
                { name: 'Project Management', color: 'gray' }
            ]
        },
        {
            id: 2,
            name: 'Priya Sharma',
            phone: '+91 8765432109',
            email: 'priya.sharma@example.com',
            role: 'Team Member',
            district: 'ahmedabad',
            image: 'https://cdn-icons-png.flaticon.com/512/219/219969.png',
            permissions: [
                { name: 'District Manager', color: 'blue' },
                { name: 'Account', color: 'green' },
                { name: 'Project Signup', color: 'yellow' }
            ]
        },
        {
            id: 3,
            name: 'Amit Patel',
            phone: '+91 7654321098',
            email: 'amit.patel@example.com',
            role: 'Project Manager',
            district: 'surat',
            image: 'https://cdn-icons-png.flaticon.com/512/219/219970.png',
            permissions: [
                { name: 'District Manager', color: 'blue' },
                { name: 'Survey BOM', color: 'cyan' },
                { name: 'Account', color: 'green' },
                { name: 'Project Signup', color: 'yellow' },
                { name: 'Project Management', color: 'gray' }
            ]
        }
    ]);

    // Fetch districts on mount
    React.useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    const getPermissionBadgeColor = (color) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cyan':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'green':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'yellow':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'gray':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPermissionIcon = (permissionName) => {
        switch (permissionName) {
            case 'District Manager':
                return <Award size={12} className="inline mr-1" />;
            case 'Survey BOM':
                return <FileText size={12} className="inline mr-1" />;
            case 'Account':
                return <CreditCard size={12} className="inline mr-1" />;
            case 'Project Signup':
                return <PenSquare size={12} className="inline mr-1" />;
            case 'Project Management':
                return <Settings size={12} className="inline mr-1" />;
            default:
                return <Shield size={12} className="inline mr-1" />;
        }
    };

    const filteredMembers = selectedDistrict === 'all'
        ? teamMembers
        : teamMembers.filter(member => member.district === selectedDistrict);

    return (
        <div className="container mx-auto px-4 py-3 max-w-7xl">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm mb-3 border-0">
                <div className="p-6">
                    <h3 className="text-2xl font-semibold mb-1">My Team</h3>
                </div>
            </div>

            {/* District Cards */}
            <div className="flex overflow-x-auto pb-3 mb-4 space-x-3">
                <div
                    className={`min-w-[150px] cursor-pointer rounded-lg shadow-sm transition-all duration-300 ${selectedDistrict === 'all'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border hover:shadow-md'
                        }`}
                    onClick={() => setSelectedDistrict('all')}
                >
                    <div className="p-4 text-center">
                        <MapPin
                            size={20}
                            className={`mx-auto mb-2 ${selectedDistrict === 'all' ? 'text-white' : 'text-blue-600'
                                }`}
                        />
                        <div className="font-semibold">All</div>
                    </div>
                </div>
                {districts.map((district) => (
                    <div
                        key={district._id}
                        className={`min-w-[150px] cursor-pointer rounded-lg shadow-sm transition-all duration-300 ${selectedDistrict === district.name.toLowerCase()
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border hover:shadow-md'
                            }`}
                        onClick={() => setSelectedDistrict(district.name.toLowerCase())}
                    >
                        <div className="p-4 text-center">
                            <MapPin
                                size={20}
                                className={`mx-auto mb-2 ${selectedDistrict === district.name.toLowerCase() ? 'text-white' : 'text-blue-600'
                                    }`}
                            />
                            <div className="font-semibold">{district.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Cards */}
            {filteredMembers.map((member) => (
                <div
                    key={member.id}
                    className="bg-white rounded-lg shadow-sm mb-3 border-0 hover:shadow-md transition-all duration-300"
                    data-district={member.district}
                >
                    <div className="p-6 flex flex-col md:flex-row items-start">
                        <div className="mr-4 mb-3 md:mb-0">
                            <img
                                src={member.image}
                                className="w-[60px] h-[60px] rounded-full border-2 border-gray-200 object-cover"
                                alt={member.name}
                            />
                        </div>
                        <div className="flex-grow">
                            <h6 className="text-lg font-semibold mb-2">{member.name}</h6>

                            <div className="space-y-1 mb-2">
                                <p className="text-sm flex items-center text-gray-600">
                                    <Phone size={14} className="mr-2 text-gray-500" />
                                    {member.phone}
                                </p>
                                <p className="text-sm flex items-center text-gray-600">
                                    <Mail size={14} className="mr-2 text-gray-500" />
                                    {member.email}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <User size={14} className="mr-2 text-gray-500" />
                                    {member.role}
                                </p>
                                <p className="text-sm flex items-center text-gray-600">
                                    <MapPin size={14} className="mr-2 text-gray-500" />
                                    {member.district.charAt(0).toUpperCase() + member.district.slice(1)}
                                </p>
                            </div>

                            <div>
                                <small className="text-xs font-semibold text-gray-700 block mb-2">
                                    User permissions:
                                </small>
                                <div className="flex flex-wrap gap-2">
                                    {member.permissions.map((permission, idx) => (
                                        <span
                                            key={idx}
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPermissionBadgeColor(permission.color)}`}
                                        >
                                            {getPermissionIcon(permission.name)}
                                            {permission.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {filteredMembers.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No team members found for this district.</p>
                </div>
            )}

            {/* Floating Add Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    id="addTeamBtn"
                    className="bg-blue-600 text-white rounded-lg shadow-lg flex items-center px-4 py-2 hover:bg-blue-700 transition-all duration-300 hover:shadow-xl"
                    onClick={() => navigate('/franchisee/my-team/add')}
                >
                    <Plus size={18} className="mr-2" />
                    Add Team
                </button>
            </div>
        </div>
    );
};

export default FranchiseMyTeam;