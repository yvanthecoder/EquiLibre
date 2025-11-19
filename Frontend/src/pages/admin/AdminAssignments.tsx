import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { assignmentService, Assignment } from '../../services/api.service';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  company?: string;
  class_id?: number;
  class_name?: string;
}

interface Maitre {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  company?: string;
  student_count: number;
}

interface Tuteur {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  student_count: number;
}

export const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [availableMaitres, setAvailableMaitres] = useState<Maitre[]>([]);
  const [availableTuteurs, setAvailableTuteurs] = useState<Tuteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    maitreId: '',
    tuteurId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, unassignedData, maitresData, tuteursData] = await Promise.all([
        assignmentService.getAllAssignments(),
        assignmentService.getUnassignedStudents(),
        assignmentService.getAvailableMaitres(),
        assignmentService.getAvailableTuteurs()
      ]);

      setAssignments(assignmentsData);
      setUnassignedStudents(unassignedData);
      setAvailableMaitres(maitresData);
      setAvailableTuteurs(tuteursData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: parseInt(formData.studentId),
        maitreId: formData.maitreId ? parseInt(formData.maitreId) : null,
        tuteurId: formData.tuteurId ? parseInt(formData.tuteurId) : null
      };

      if (editingAssignment) {
        // Update existing assignment
        await assignmentService.updateAssignment(editingAssignment.id, {
          maitreId: payload.maitreId,
          tuteurId: payload.tuteurId
        });
      } else {
        // Create new assignment
        await assignmentService.createAssignment(payload);
      }

      // Reset form and refresh
      setFormData({ studentId: '', maitreId: '', tuteurId: '' });
      setShowCreateModal(false);
      setEditingAssignment(null);
      fetchData();
    } catch (err: any) {
      console.error('Error saving assignment:', err);
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      studentId: assignment.student_id.toString(),
      maitreId: assignment.maitre_id?.toString() || '',
      tuteurId: assignment.tuteur_id?.toString() || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) return;

    try {
      await assignmentService.deleteAssignment(assignmentId);
      fetchData();
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAssignment(null);
    setFormData({ studentId: '', maitreId: '', tuteurId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Assignations</h1>
        <Button onClick={() => setShowCreateModal(true)} disabled={unassignedStudents.length === 0}>
          Créer une assignation
        </Button>
      </div>

      {/* Unassigned Students Alert */}
      {unassignedStudents.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl"> </span>
            <div>
              <h3 className="font-semibold text-gray-900">Étudiants non assignés</h3>
              <p className="text-sm text-gray-600 mt-1">
                {unassignedStudents.length} étudiant(s) n'ont pas encore d'assignation.
              </p>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card>
          <p className="text-center py-8 text-gray-500">Chargement...</p>
        </Card>
      ) : error ? (
        <Card>
          <p className="text-center py-8 text-red-500">{error}</p>
        </Card>
      ) : assignments.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-gray-500">Aucune assignation trouvée</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  {/* Student Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {assignment.student_firstname?.[0]}{assignment.student_lastname?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {assignment.student_firstname} {assignment.student_lastname}
                      </h3>
                      <p className="text-sm text-gray-600">{assignment.student_email}</p>
                      {assignment.student_company && (
                        <p className="text-sm text-gray-500">Entreprise: {assignment.student_company}</p>
                      )}
                      {assignment.class_name && (
                        <p className="text-sm text-gray-500">Classe: {assignment.class_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-15">
                    {/* Maître Info */}
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-700">Maître:</span>
                      {assignment.maitre_firstname ? (
                        <div>
                          <p className="text-sm text-gray-900">
                            {assignment.maitre_firstname} {assignment.maitre_lastname}
                          </p>
                          <p className="text-xs text-gray-600">{assignment.maitre_email}</p>
                          {assignment.maitre_company && (
                            <p className="text-xs text-gray-500">{assignment.maitre_company}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-red-500">Non assigné</span>
                      )}
                    </div>

                    {/* Tuteur Info */}
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-700">Tuteur:</span>
                      {assignment.tuteur_firstname ? (
                        <div>
                          <p className="text-sm text-gray-900">
                            {assignment.tuteur_firstname} {assignment.tuteur_lastname}
                          </p>
                          <p className="text-xs text-gray-600">{assignment.tuteur_email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-red-500">Non assigné</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(assignment)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(assignment.id)}>
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
                {editingAssignment ? 'Modifier l\'assignation' : 'Créer une assignation'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Étudiant *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingAssignment}
                  >
                    <option value="">Sélectionnez un étudiant</option>
                    {editingAssignment ? (
                      <option value={editingAssignment.student_id}>
                        {editingAssignment.student_firstname} {editingAssignment.student_lastname}
                      </option>
                    ) : (
                      unassignedStudents.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstname} {student.lastname} - {student.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maître d'apprentissage
                  </label>
                  <select
                    value={formData.maitreId}
                    onChange={(e) => setFormData({ ...formData, maitreId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun maître</option>
                    {availableMaitres.map(maitre => (
                      <option key={maitre.id} value={maitre.id}>
                        {maitre.firstname} {maitre.lastname} - {maitre.company} ({maitre.student_count} étudiant(s))
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tuteur d'école
                  </label>
                  <select
                    value={formData.tuteurId}
                    onChange={(e) => setFormData({ ...formData, tuteurId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun tuteur</option>
                    {availableTuteurs.map(tuteur => (
                      <option key={tuteur.id} value={tuteur.id}>
                        {tuteur.firstname} {tuteur.lastname} ({tuteur.student_count}/2 étudiants)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Un tuteur peut avoir maximum 2 étudiants
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAssignment ? 'Mettre à jour' : 'Créer'}
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
