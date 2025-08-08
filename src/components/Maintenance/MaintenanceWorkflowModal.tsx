import React, { useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, CheckCircle2 } from 'lucide-react';
import type {
  Attachment,
  ChecklistItem,
  ISODateTime,
  SelfPerformedMaintenance,
  Signature,
  TaskPriority,
  UUID,
} from '../../types/equipment';
import type { Asset } from '../../types/Asset';

interface MaintenanceWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAssetId?: string | null;
  onComplete: (payload: {
    spm: SelfPerformedMaintenance;
    historyRecord: {
      id: string;
      completedAt: string;
      title: string;
      assetName: string;
      technician?: string;
      durationHours?: number;
      outcome?: 'success' | 'partial' | 'failed';
    };
  }) => void;
}

// Simple id generator for demo/local usage
const rid = () => Math.random().toString(36).slice(2);

// A tiny in-modal signature pad using canvas
const SignaturePad: React.FC<{
  onChange: (dataUrl: string | null) => void;
}> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    const { x, y } = getPos(e);
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasDrawn(true);
  };

  const end = () => {
    isDrawing.current = false;
    const c = canvasRef.current!;
    onChange(hasDrawn ? c.toDataURL('image/png') : null);
  };

  const getPos = (e: any) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
    onChange(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Signature</span>
        <button onClick={clear} className="text-xs text-blue-600 hover:underline">Clear</button>
      </div>
      <div className="border rounded-md bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-40 touch-none"
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={end}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">Sign above to complete.</p>
    </div>
  );
};

const PhotoUpload: React.FC<{
  files: Attachment[];
  onAdd: (atts: Attachment[]) => void;
  onRemove: (id: string) => void;
}> = ({ files, onAdd, onRemove }) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files;
    if (!f || f.length === 0) return;

    const items: Attachment[] = [];
    for (let i = 0; i < f.length; i++) {
      const file = f[i];
      const url = URL.createObjectURL(file);
      items.push({
        id: rid(),
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        url,
        uploadedAt: new Date().toISOString(),
      });
    }
    onAdd(items);
    // reset
    e.currentTarget.value = '' as any;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white cursor-pointer hover:bg-gray-50">
          <Upload className="w-4 h-4 mr-2" /> Upload
          <input className="hidden" type="file" multiple accept="image/*" onChange={handleChange} />
        </label>
        <span className="text-xs text-gray-500">Attach photos for documentation.</span>
      </div>
      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {files.map((p) => (
            <div key={p.id} className="relative">
              <img src={p.url} alt={p.fileName} className="w-full h-24 object-cover rounded" />
              <button
                className="absolute top-1 right-1 bg-white/90 rounded px-1 text-xs shadow"
                onClick={() => onRemove(p.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Checklist renderer minimal
const ChecklistStep: React.FC<{
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}> = ({ items, onChange }) => {
  const update = (idx: number, patch: Partial<ChecklistItem>) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], ...patch, capturedAt: new Date().toISOString() as ISODateTime };
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {items.map((ci, idx) => (
        <div key={ci.id} className="p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{ci.prompt}</div>
              {ci.unit && (
                <div className="text-xs text-gray-500">Unit: {ci.unit}</div>
              )}
            </div>
            {ci.type === 'boolean' && (
              <input
                type="checkbox"
                checked={!!ci.valueBoolean}
                onChange={(e) => update(idx, { valueBoolean: e.target.checked })}
              />
            )}
          </div>
          {ci.type === 'numeric' && (
            <div className="mt-2">
              <input
                type="number"
                className="w-40 px-3 py-2 border rounded-md"
                value={ci.valueNumber ?? ''}
                onChange={(e) => update(idx, { valueNumber: Number(e.target.value) })}
              />
              {(ci.min !== undefined || ci.max !== undefined) && (
                <div className="text-xs text-gray-500 mt-1">Range: {ci.min ?? '-'} to {ci.max ?? '-'}</div>
              )}
            </div>
          )}
          {ci.type === 'text' && (
            <div className="mt-2">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={ci.valueText ?? ''}
                onChange={(e) => update(idx, { valueText: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const MaintenanceWorkflowModal: React.FC<MaintenanceWorkflowModalProps> = ({ isOpen, onClose, assets, selectedAssetId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assetId, setAssetId] = useState<string | undefined>(selectedAssetId || assets[0]?.id);
  const [priority, setPriority] = useState<TaskPriority>('medium' as TaskPriority);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: rid(), prompt: 'Lockout/Tagout performed', type: 'boolean', valueBoolean: false, capturedAt: undefined },
    { id: rid(), prompt: 'Visual inspection complete', type: 'boolean', valueBoolean: false, capturedAt: undefined },
    { id: rid(), prompt: 'Record discharge pressure', type: 'numeric', unit: 'PSI', min: 0, max: 1000, capturedAt: undefined },
    { id: rid(), prompt: 'Observations', type: 'text', capturedAt: undefined },
  ]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [startedAt] = useState<Date>(new Date());

  const asset = useMemo(() => assets.find(a => a.id === assetId), [assets, assetId]);

  if (!isOpen) return null;

  const steps = [
    { title: 'Checklist', content: (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
          <select
            className="w-full sm:w-80 px-3 py-2 border rounded-md"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
          >
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select className="w-40 px-3 py-2 border rounded-md" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <ChecklistStep items={checklist} onChange={setChecklist} />
      </div>
    ) },
    { title: 'Photos', content: (
      <PhotoUpload
        files={attachments}
        onAdd={(a) => setAttachments((prev) => [...prev, ...a])}
        onRemove={(id) => setAttachments((prev) => prev.filter(p => p.id !== id))}
      />
    ) },
    { title: 'Notes', content: (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Notes & Observations</label>
        <textarea
          className="w-full min-h-32 px-3 py-2 border rounded-md"
          value={notes}
          placeholder="Add any observations, findings, or follow-up recommendations..."
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    ) },
    { title: 'Signature', content: (
      <SignaturePad onChange={setSignatureDataUrl} />
    ) },
  ];

  const canNext = () => {
    if (currentStep === 0) {
      // Require first two booleans checked
      const a = checklist[0]?.valueBoolean;
      const b = checklist[1]?.valueBoolean;
      return !!a && !!b;
    }
    if (currentStep === 3) {
      return !!signatureDataUrl;
    }
    return true;
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleComplete = () => {
    if (!asset) return;

    const endedAt = new Date();
    const durationHours = Math.max(0.1, (endedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60));

    const spm: SelfPerformedMaintenance = {
      id: `SPM-${rid()}` as UUID,
      equipmentId: asset.id as unknown as UUID,
      title: `Self-Performed Maintenance - ${asset.name}`,
      description: notes || 'Self-performed maintenance',
      priority: priority as any,
      status: 'completed' as any,
      actualStart: startedAt.toISOString() as ISODateTime,
      actualEnd: endedAt.toISOString() as ISODateTime,
      createdByUserId: 'user-1' as UUID,
      approvals: [],
      lockoutTagoutPerformed: !!checklist[0]?.valueBoolean,
      checklists: checklist,
      attachments,
      logs: [
        { at: startedAt.toISOString() as ISODateTime, userId: 'user-1' as UUID, message: 'Task started' },
        { at: endedAt.toISOString() as ISODateTime, userId: 'user-1' as UUID, message: 'Task completed' },
      ],
      acceptance: {
        result: 'pass',
        signedOffBy: signatureDataUrl ? ({ byUserId: 'user-1' as UUID, byName: 'Technician', at: endedAt.toISOString() as ISODateTime } as Signature) : undefined,
      },
      followUpRecommendations: [],
      createdAt: startedAt.toISOString() as ISODateTime,
      updatedAt: endedAt.toISOString() as ISODateTime,
    };

    const historyRecord = {
      id: spm.id,
      completedAt: spm.actualEnd!,
      title: spm.title,
      assetName: asset.name,
      technician: 'Technician',
      durationHours: Number(durationHours.toFixed(2)),
      outcome: 'success' as const,
    };

    try {
      const key = '__maintenance_history__';
      const existingRaw = localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const next = [historyRecord, ...existing];
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}

    onComplete({ spm, historyRecord });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Guided Maintenance</h3>
            <p className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length} • {steps[currentStep].title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-auto pr-1">
          {steps[currentStep].content}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm ${currentStep === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canNext()}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm text-white ${canNext() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canNext()}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm text-white ${canNext() ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'}`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Maintenance
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceWorkflowModal;

