import React, { useState } from 'react';
import { TechnicalBulletin, Asset } from '../../types/Asset';
import { 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building, 
  Mail, 
  Phone,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Package
} from 'lucide-react';

interface TechnicalBulletinCardProps {
  bulletin: TechnicalBulletin;
  onMarkAsRead: (bulletinId: string) => void;
  assets: Asset[];
}

const TechnicalBulletinCard: React.FC<TechnicalBulletinCardProps> = ({ bulletin, onMarkAsRead, assets }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleMarkAsRead = () => {
    if (!bulletin.isRead) {
      onMarkAsRead(bulletin.id);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconClass = severity === 'critical' ? 'text-red-600' : 
                     severity === 'high' ? 'text-orange-600' :
                     severity === 'medium' ? 'text-yellow-600' :
                     'text-blue-600';
    return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'equipment_change':
        return 'Equipment Change';
      case 'safety_update':
        return 'Safety Update';
      case 'maintenance_alert':
        return 'Maintenance Alert';
      case 'recall':
        return 'Product Recall';
      case 'general':
        return 'General Notice';
      default:
        return type;
    }
  };

  const affectedAssets = assets.filter(asset => 
    bulletin.affectedEquipmentTypes?.includes(asset.equipmentType) ||
    bulletin.affectedAssets?.includes(asset.id)
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = bulletin.expiryDate && new Date(bulletin.expiryDate) < new Date();

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
      bulletin.isRead ? 'border-gray-200' : getSeverityColor(bulletin.severity).split(' ')[1]
    } ${!bulletin.isRead ? 'ring-1 ring-opacity-20 ' + getSeverityColor(bulletin.severity).split(' ')[1] : ''}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {getSeverityIcon(bulletin.severity)}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                getSeverityColor(bulletin.severity)
              }`}>
                {bulletin.severity.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {getTypeLabel(bulletin.type)}
              </span>
              {!bulletin.isRead && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  NEW
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  EXPIRED
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-4">
              {bulletin.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Published {new Date(bulletin.publishDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Building className="w-4 h-4" />
                <span>{bulletin.vendorInfo.company}</span>
              </div>
              
              {bulletin.expiryDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Expires {new Date(bulletin.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {affectedAssets.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{affectedAssets.length} asset(s) affected</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Details
                </>
              )}
            </button>
            
            {!bulletin.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {bulletin.description}
            </p>
          </div>

          {/* Affected Assets */}
          {affectedAssets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Affected Assets ({affectedAssets.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {affectedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md"
                  >
                    <Package className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-yellow-900 truncate">                        {asset.name}
                      </p>
                      <p className="text-xs text-yellow-700">
                        {asset.equipmentType} • {asset.serialNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {bulletin.attachments && bulletin.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Attachments ({bulletin.attachments.length})
              </h4>
              <div className="space-y-2">
                {bulletin.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                      </div>
                    </div>
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      onClick={handleMarkAsRead}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Contact Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Vendor Contact</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Building className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{bulletin.vendorInfo.company}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bulletin.vendorInfo.contactEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${bulletin.vendorInfo.contactEmail}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {bulletin.vendorInfo.contactEmail}
                    </a>
                  </div>
                )}
                {bulletin.vendorInfo.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${bulletin.vendorInfo.contactPhone}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {bulletin.vendorInfo.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {bulletin.tags && bulletin.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {bulletin.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicalBulletinCard;

