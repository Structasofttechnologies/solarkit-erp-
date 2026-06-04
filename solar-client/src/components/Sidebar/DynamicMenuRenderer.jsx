import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import authStore from '../../store/authStore';

const DynamicMenuRenderer = ({ existingRoutes = [], theme = 'light' }) => {
  const { user } = authStore();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (label, e) => {
    if (e) e.preventDefault();
    setOpenSubMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getDynamicIcon = (iconName) => {
    const IconComponent = Icons[iconName] || Icons.Layers;
    return IconComponent;
  };

  // Filter out any modules that are already part of the hardcoded sidebar
  const dynamicModules = useMemo(() => {
    if (!user?.dynamicMenuTree) return [];
    
    // Convert existingRoutes to a Set for fast lookup
    const routeSet = new Set(existingRoutes.map(r => r.toLowerCase()));

    return user.dynamicMenuTree.filter(item => {
      // If it's a single item, just check if its route is in existingRoutes
      if (!item.hasDropdown || !item.subItems || item.subItems.length === 0) {
        return item.route && !routeSet.has(item.route.toLowerCase());
      }
      
      // If it's a parent with subItems, check if ALL subItems are already in existingRoutes
      // If they are all in existingRoutes, then this parent is completely redundant
      const allSubItemsCovered = item.subItems.every(sub => 
        sub.route && routeSet.has(sub.route.toLowerCase())
      );
      
      return !allSubItemsCovered;
    });
  }, [user?.dynamicMenuTree, existingRoutes]);

  if (!dynamicModules || dynamicModules.length === 0) return null;

  const isDark = theme === 'dark';

  return (
    <>
      {/* Separator to differentiate dynamic modules */}
      <div className="px-6 py-2 mt-4">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Additional Modules</h3>
      </div>
      
      <div className="px-4 space-y-1 mb-6">
        {dynamicModules.map((item) => {
          if (item.hasDropdown && item.subItems?.length > 0) {
            const isOpen = openSubMenus[item.name];
            const IconComponent = getDynamicIcon(item.icon);
            
            // Filter subItems that are already in existingRoutes
            const routeSet = new Set(existingRoutes.map(r => r.toLowerCase()));
            const visibleSubItems = item.subItems.filter(sub => !sub.route || !routeSet.has(sub.route.toLowerCase()));

            return (
              <div key={item._id} className="mt-1">
                <button
                  onClick={(e) => toggleSubMenu(item.name, e)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isDark 
                      ? isOpen ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : isOpen ? 'bg-[#142340] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent size={20} className={isDark ? (isOpen ? 'text-white' : 'text-gray-400') : (isOpen ? 'text-white' : 'text-gray-600')} />
                    <span className="font-medium text-[15px]">{item.name}</span>
                  </div>
                  {isOpen ? <Icons.ChevronUp size={18} /> : <Icons.ChevronDown size={18} />}
                </button>
                
                {isOpen && (
                  <div className={`${isDark ? 'bg-gray-900 border-l border-gray-700 ml-4 pl-2 mt-2' : 'bg-[#e9eef5] shadow-inner mt-1 px-2'} py-2 rounded-xl flex flex-col space-y-1`}>
                    {visibleSubItems.map((subItem, index) => {
                      const SubIcon = getDynamicIcon(subItem.icon);
                      return (
                        <NavLink
                          key={subItem._id || index}
                          to={subItem.route || '#'}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-2 mx-1 rounded-lg transition-colors ${
                              isDark
                                ? isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                : isActive ? 'bg-[#142340] text-white font-semibold' : 'text-[#142340] hover:bg-[#dce4ee]'
                            }`
                          }
                        >
                          <SubIcon size={18} />
                          <span className="text-[14.5px]">{subItem.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            const IconComponent = getDynamicIcon(item.icon);
            return (
              <NavLink
                key={item._id}
                to={item.route || '#'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                    isDark
                      ? isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`
                }
              >
                <IconComponent size={20} />
                <span className="font-medium text-[15px]">{item.name}</span>
              </NavLink>
            );
          }
        })}
      </div>
    </>
  );
};

export default DynamicMenuRenderer;
