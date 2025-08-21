'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Home,
  MapPin,
  Square,
  Building,
  User
} from 'lucide-react';
import Link from 'next/link';
import { propertyAPI, Property, CreatePropertyRequest, userAPI } from '@/services/api';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';


function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customers, setCustomers] = useState<Array<{_id: string, name: string, email: string}>>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('');

  // Function to get customer info from either string ID or populated object
  const getCustomerInfo = (property: Property) => {
    if (!property.customer) return null;
    
    if (typeof property.customer === 'object' && property.customer.name) {
      return property.customer;
    }
    
    if (typeof property.customer === 'string') {
      return customers.find(customer => customer._id === property.customer);
    }
    
    return null;
  };

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null); // Still needed for manual edit modal
  const [editingManual, setEditingManual] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchProperties();
    fetchCustomers();
  }, []);

  // Handle URL parameters for customer filtering
  useEffect(() => {
    const customerParam = searchParams.get('customer');
    if (customerParam && customers.length > 0) {
      // Check if the customer exists in our customers list
      const customerExists = customers.find(c => c._id === customerParam);
      if (customerExists) {
        setSelectedCustomerFilter(customerParam);
        filterPropertiesByCustomer(customerParam);
      }
    }
  }, [searchParams, customers]);

  // Re-apply filter when both properties and customers are loaded
  useEffect(() => {
    if (selectedCustomerFilter && customers.length > 0 && properties.length > 0) {
      console.log('Re-applying filter with all data loaded');
      filterPropertiesByCustomer(selectedCustomerFilter);
    }
  }, [customers, properties, selectedCustomerFilter]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const users = await userAPI.getAll();
      const customerUsers = users.filter(user => user.role === 'customer');
      setCustomers(customerUsers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyAPI.getAll();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  // Filter properties by customer
  const filterPropertiesByCustomer = (customerId: string) => {
    setSelectedCustomerFilter(customerId);
    
    if (!customerId) {
      setFilteredProperties(properties);
      return;
    }
    
    // Make sure we have both properties and customers data
    if (properties.length === 0 || customers.length === 0) {
      console.log('Data not ready yet, skipping filter');
      return;
    }
    
    console.log('Filtering for customer ID:', customerId);
    console.log('Available customers:', customers);
    console.log('Available properties:', properties);
    
    const filtered = properties.filter(property => {
      const customerInfo = getCustomerInfo(property);
      console.log('Property:', property.name, 'Customer info:', customerInfo);
      return customerInfo && customerInfo._id === customerId;
    });
    
    console.log('Filtered properties:', filtered);
    setFilteredProperties(filtered);
  };

  const handleAddProperty = async (propertyData: CreatePropertyRequest) => {
    try {
      await propertyAPI.create(propertyData);
      toast.success('Property added successfully');
      setShowAddModal(false);
      fetchProperties();
    } catch (error: any) {
      console.error('Error adding property:', error);
      
      // Handle specific error for existing property
      if (error.response?.status === 400 && error.response?.data?.message === 'Property ID already exists') {
        toast.error('A property with this ID already exists. Please use a different property ID.');
      } else {
        toast.error('Failed to add property');
      }
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
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleManualEdit = async (property: Property) => {
    setSelectedProperty(property);
    setShowManualModal(true);
    
    try {
      // Fetch the manual data for this property
      const manualData = await propertyAPI.getManual(property._id!);
      setEditingManual({
        title: manualData.title || 'Live Cleaning & Maintenance Manual',
        content: manualData.content || ''
      });
    } catch (error) {
      console.error('Error fetching manual:', error);
      // Set default values if manual doesn't exist
      setEditingManual({
        title: 'Live Cleaning & Maintenance Manual',
        content: ''
      });
    }
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
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading properties...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage customer's properties and cleaning manuals</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Filter by Customer:
                </label>
                <select
                  value={selectedCustomerFilter}
                  onChange={(e) => filterPropertiesByCustomer(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[200px]"
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action and Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {selectedCustomerFilter && (
                <button
                  onClick={() => filterPropertiesByCustomer('')}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  Clear Filter
                </button>
              )}
              {selectedCustomerFilter && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredProperties.length} of {properties.length} properties
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
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
                  {(() => {
                    const customerInfo = getCustomerInfo(property);
                    return customerInfo && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                          <User className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          <span>{customerInfo.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                          {customerInfo.email}
                        </p>
                      </div>
                    );
                  })()}
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
                    href={`/properties/edit?id=${property._id}`}
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

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedCustomerFilter ? 'No properties found for selected customer' : 'No properties found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedCustomerFilter ? 'Try selecting a different customer or clear the filter' : 'Get started by adding your first property'}
            </p>
            {!selectedCustomerFilter && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Add Property</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProperty}
          customers={customers}
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
    </ProtectedRoute>
  );
}

// Modal Components
function AddPropertyModal({ 
  onClose, 
  onAdd,
  customers 
}: { 
  onClose: () => void; 
  onAdd: (data: CreatePropertyRequest) => void;
  customers: Array<{_id: string, name: string, email: string}>;
}) {
  const [formData, setFormData] = useState({
    propertyId: '',
    name: '',
    address: '',
    type: '',
    squareFootage: '',
    cycle: '',
    isActive: false,
    customer: '',
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
      cycle: formData.cycle,
      isActive: formData.isActive,
      customer: formData.customer,
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
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Enter property type"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cleaning Cycle
              </label>
              <input
                type="text"
                value={formData.cycle || ''}
                onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Customer Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer
              </label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer: {_id: string, name: string, email: string}) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
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

// Main component with Suspense wrapper
export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading properties...</p>
        </div>
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  );
}