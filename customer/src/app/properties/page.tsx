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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer';
}

export default function PropertiesPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingManual, setEditingManual] = useState({ title: '', content: '' });

  const currentUser = authUser as User | null;

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchProperties();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  const fetchProperties = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await propertyAPI.getAll();
      const filtered = data.filter(p => p.customer === currentUser._id);
      setProperties(filtered);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (propertyData: CreatePropertyRequest) => {
    if (!currentUser) return;
    try {
      const newProperty = await propertyAPI.create({ 
        ...propertyData, 
        customer: currentUser._id 
      });
      toast.success('Property added successfully');
      setProperties(prev => [...prev, newProperty]); // update local state
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="flex flex-col space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Delete Property</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this property? This action cannot be undone.</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                resolve(false);
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                resolve(true);
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
      });
    });

    if (!confirmed) return;
    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully');
      setProperties(prev => prev.filter(p => p._id !== id));
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
      const updated = await propertyAPI.updateManual(selectedProperty._id!, editingManual);
      toast.success('Manual updated successfully');
      setProperties(prev => prev.map(p => p._id === updated._id ? updated : p));
      setShowManualModal(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error updating manual:', error);
      toast.error('Failed to update manual');
    }
  };

  const handleToggleStatus = async (property: Property) => {
    try {
      const updated = await propertyAPI.update(property._id!, { isActive: !property.isActive });
      toast.success(`Property ${updated.isActive ? 'activated' : 'deactivated'} successfully`);
      setProperties(prev => prev.map(p => p._id === updated._id ? updated : p));
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage my properties and cleaning manuals</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {property.propertyId}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {property.address}
                  </p>
                </div>
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
      {showAddModal && currentUser && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProperty}
          currentUserId={currentUser._id}
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

// Simplified AddPropertyModal: no customer select, auto-assigns currentUser
function AddPropertyModal({ 
  onClose, 
  onAdd,
  currentUserId
}: { 
  onClose: () => void; 
  onAdd: (data: CreatePropertyRequest) => void;
  currentUserId: string;
}) {
  const [formData, setFormData] = useState({
    propertyId: '',
    name: '',
    address: '',
    type: '',
    squareFootage: '',
    cycle: '',
    isActive: false,
    manual: {
      title: 'Live Cleaning & Maintenance Manual',
      content: ''
    },
    roomTasks: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const propertyData: CreatePropertyRequest = {
      propertyId: formData.propertyId,
      name: formData.name,
      address: formData.address,
      type: formData.type,
      squareFootage: parseInt(formData.squareFootage) || 0,
      cycle: formData.cycle,
      isActive: formData.isActive,
      customer: currentUserId,
      roomTasks: []
    };
    onAdd(propertyData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Property</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Property ID"
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Square Footage"
              value={formData.squareFootage}
              onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Cleaning Cycle"
            value={formData.cycle}
            onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Add Property</button>
          </div>
        </form>
      </div>
    </div>
  );
}
