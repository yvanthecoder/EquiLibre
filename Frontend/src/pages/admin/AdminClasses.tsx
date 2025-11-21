import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import api from '../../lib/api';

interface Class {
  id: number;
  name: string;
  description?: string;
  year?: string;
  level?: string;
  tuteur_id?: number;
  tuteur_firstname?: string;
  tuteur_lastname?: string;
  member_count?: number;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: new Date().getFullYear().toString(),
    level: '',
    tuteurId: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      const payload = response.data;
      const data = Array.isArray(payload) ? payload : payload.data || payload?.classes || [];
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Impossible de charger les classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        year: formData.year,
        level: formData.level,
        tuteurId: formData.tuteurId ? parseInt(formData.tuteurId) : null
      };

      if (editingClass) {
        // Update existing class
        await api.put(`/classes/${editingClass.id}`, payload);
      } else {
        // Create new class
        await api.post(`/classes`, payload);
      }

      // Reset form and refresh
      setFormData({ name: '', description: '', year: new Date().getFullYear().toString(), level: '', tuteurId: '' });
      setShowCreateModal(false);
      setEditingClass(null);
      fetchClasses();
    } catch (err: any) {
      console.error('Error saving class:', err);
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      year: classItem.year || new Date().getFullYear().toString(),
      level: classItem.level || '',
      tuteurId: classItem.tuteur_id?.toString() || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (classId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;

    try {
      await api.delete(`/classes/${classId}`);
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingClass(null);
    setFormData({ name: '', description: '', year: new Date().getFullYear().toString(), level: '', tuteurId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Classes</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Créer une classe
        </Button>
      </div>

      {loading ? (
        <Card>
          <p className="text-center py-8 text-gray-500">Chargement...</p>
        </Card>
      ) : error ? (
        <Card>
          <p className="text-center py-8 text-red-500">{error}</p>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-gray-500">Aucune classe trouvée</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(classItem => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {classItem.year}
                  </span>
                </div>

                {classItem.description && (
                  <p className="text-sm text-gray-600">{classItem.description}</p>
                )}

                <div className="space-y-1 text-sm">
                  {classItem.level && (
                    <p className="text-gray-600">Niveau: {classItem.level}</p>
                  )}
                  {classItem.tuteur_firstname && (
                    <p className="text-gray-600">
                      Tuteur: {classItem.tuteur_firstname} {classItem.tuteur_lastname}
                    </p>
                  )}
                  <p className="text-gray-600">
                    Étudiants: {classItem.member_count || 0}
                  </p>
                </div>

                <div className="flex space-x-2 pt-3 border-t">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(classItem)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50" onClick={() => handleDelete(classItem.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingClass ? 'Modifier la classe' : 'Créer une classe'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la classe *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année *
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau
                    </label>
                    <input
                      type="text"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="L3, M1, M2..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingClass ? 'Mettre à jour' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
