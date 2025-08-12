'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Home,
  MapPin,
  Square,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { propertyAPI, Property, CreatePropertyRequest } from '@/services/api';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null); // Still needed for manual edit modal
  const [editingManual, setEditingManual] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyAPI.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (propertyData: CreatePropertyRequest) => {
    try {
      await propertyAPI.create(propertyData);
      toast.success('Property added successfully');
      setShowAddModal(false);
      fetchProperties();
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleManualEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditingManual({
      title: property.manual?.title || 'Live Cleaning & Maintenance Manual',
      content: property.manual?.content || ''
    });
    setShowManualModal(true);
  };

  const handleManualSave = async () => {
    if (!selectedProperty) return;
    
    try {
      await propertyAPI.updateManual(selectedProperty._id!, editingManual);
      toast.success('Manual updated successfully');
      setShowManualModal(false);
      setSelectedProperty(null);
      fetchProperties();
    } catch (error) {
      console.error('Error updating manual:', error);
      toast.error('Failed to update manual');
    }
  };

  const handleToggleStatus = async (property: Property) => {
    try {
      await propertyAPI.update(property._id!, { isActive: !property.isActive });
      toast.success(`Property ${property.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchProperties();
    } catch (error) {
      console.error('Error toggling property status:', error);
      toast.error('Failed to update property status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading properties...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Properties</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your properties and cleaning manuals</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {property.propertyId}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {property.address}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(property)}
                    className={`px-2 py-1 text-xs rounded-full ${
                      property.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {property.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Property Type</p>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                      <Building className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                      <span>{property.type || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Size</p>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                      <Square className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                      <span>{property.squareFootage ? `${property.squareFootage} sq ft` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleManualEdit(property)}
                  className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  <span>Manual</span>
                </button>
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/properties/${property._id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteProperty(property._id!)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first property</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Add Property</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProperty}
        />
      )}



      {/* Manual Edit Modal */}
      {showManualModal && selectedProperty && (
        <ManualEditModal
          manual={editingManual}
          onClose={() => {
            setShowManualModal(false);
            setSelectedProperty(null);
          }}
          onSave={handleManualSave}
          onChange={setEditingManual}
        />
      )}
    </DashboardLayout>
  );
}

// Modal Components
function AddPropertyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: CreatePropertyRequest) => void }) {
  const [formData, setFormData] = useState({
    propertyId: '',
    name: '',
    address: '',
    type: 'apartment' as 'apartment' | 'house' | 'office',
    squareFootage: '',
    rooms: '1',
    bathrooms: '1',
    estimatedTime: '60', // in minutes
    manual: {
      title: 'Live Cleaning & Maintenance Manual',
      content: ''
    },
    roomTasks: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the property data with all required fields
    const propertyData: CreatePropertyRequest = {
      propertyId: formData.propertyId,
      name: formData.name,
      address: formData.address,
      type: formData.type,
      squareFootage: parseInt(formData.squareFootage) || 0,
      rooms: parseInt(formData.rooms) || 1,
      bathrooms: parseInt(formData.bathrooms) || 1,
      estimatedTime: `${formData.estimatedTime} minutes`,
      manual: {
        ...formData.manual,
        content: formData.manual.content || `Live Cleaning & Maintenance Manual\n${formData.address}\nProperty Overview\n- Property ID: ${formData.propertyId}\n- Type: ${formData.type}\n- Square Footage: ${formData.squareFootage} sq ft`
      },
      roomTasks: []
    };
    
    console.log('Submitting property data:', propertyData);
    onAdd(propertyData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Property</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property ID</label>
            <input
              type="text"
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'apartment' | 'house' | 'office' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="office">Office</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Square Footage</label>
              <input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



function ManualEditModal({ manual, onClose, onSave, onChange }: { 
  manual: { title: string; content: string }; 
  onClose: () => void; 
  onSave: () => void;
  onChange: (manual: { title: string; content: string }) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Cleaning Manual</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={manual.title}
              onChange={(e) => onChange({ ...manual, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea
              value={manual.content}
              onChange={(e) => onChange({ ...manual, content: e.target.value })}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter cleaning instructions, special requirements, and maintenance notes..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Save Manual
          </button>
        </div>
      </div>
    </div>
  );
} 