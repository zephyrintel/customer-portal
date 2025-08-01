import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MaintenanceItem } from '../types/Maintenance';
import { Asset } from '../types/Asset';
import MaintenanceSchedulingModal from '../components/Maintenance/MaintenanceSchedulingModal';
import { getMockAssets } from '../data/mockData';
import { useMaintenanceFiltering } from '../hooks/useMaintenanceFiltering';
import { useDeviceType } from '../hooks/useTouch';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Wrench,
  AlertCircle,
  Info
} from 'lucide-react';

const MaintenanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [maintenanceItem, setMaintenanceItem] = useState<MaintenanceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const assets = getMockAssets();
    const asset = assets.find(a => a.id === id);
    if (asset) {
      const maintenance: MaintenanceItem = {
        id: asset.id,
        name: asset.name,
        status: asset.currentStatus,
        lastMaint: asset.lastMaintenance,
        priority: 'medium', // derive appropriately
        equipmentType: asset.equipmentType,
        location: `${asset.location.facility} - ${asset.location.area}`,
        asset,
        maintenanceDetails: 'Details here',
      };
      setMaintenanceItem(maintenance);
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!maintenanceItem) return <div>Maintenance item not found</div>;

  const {
    name,
    location,
    priority,
    daysOverdue,
    lastMaint,
    asset,
  } = maintenanceItem;

  const handleScheduleClick = () => {
    setShowModal(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{name}</h2>
      <div className="flex items-center mb-4">
        <span className="font-semibold">Location:</span>&nbsp;
        <span>{location}</span>
      </div>
      <div className="flex items-center mb-4">
        <span className={getPriorityBadge(priority)}>
          {getPriorityIcon(priority)} {priority}
        </span>
      </div>
      <div className="flex items-center mb-4">
        <span className="font-semibold">Days Overdue:</span>&nbsp;
        <span>{daysOverdue ?? 'None'}</span>
      </div>
      <div className="flex items-center mb-4">
        <span className="font-semibold">Last Maintenance:</span>&nbsp;
        <span>{lastMaint ?? 'Never'}</span>
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleScheduleClick}
      >
        Schedule Maintenance
      </button>

      <MaintenanceSchedulingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        asset={asset}
        onSchedule={() => setShowModal(false)}
      />
    </div>
  );
};

export default MaintenanceDetailPage;

