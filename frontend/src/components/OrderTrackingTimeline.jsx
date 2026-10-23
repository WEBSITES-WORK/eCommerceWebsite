import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const steps = [
  { status: 'Confirmed', label: 'Order Confirmed', icon: Clock },
  { status: 'Processing', label: 'Processing', icon: Package },
  { status: 'Packed', label: 'Packed & Inspected', icon: Package },
  { status: 'Shipped', label: 'Shipped', icon: Truck },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: CheckCheck },
];

const statusOrderMap = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Packed: 3,
  Shipped: 4,
  'Out for Delivery': 5,
  Delivered: 6,
  Cancelled: -1,
  Refunded: -2,
};

const OrderTrackingTimeline = ({ currentStatus, statusHistory = [], dark = false }) => {
  const isCancelled = currentStatus === 'Cancelled';
  const isRefunded = currentStatus === 'Refunded';

  if (isCancelled || isRefunded) {
    return (
      <div className={`p-6 rounded-2xl flex items-center gap-4 border ${
        dark
          ? 'bg-rose-950/30 border-rose-900/60 text-rose-300'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        {isCancelled ? (
          <AlertTriangle className="w-8 h-8 text-rose-500 flex-shrink-0" />
        ) : (
          <RotateCcw className="w-8 h-8 text-rose-500 flex-shrink-0" />
        )}
        <div>
          <h4 className="font-bold text-base">
            Order Status: <span className="uppercase">{currentStatus}</span>
          </h4>
          <p className={`text-xs mt-1 ${dark ? 'text-rose-400' : 'text-rose-700'}`}>
            {isCancelled
              ? 'This order has been cancelled and any reserved items have been restored to inventory.'
              : 'This order has been refunded. The refund amount will credit to your account shortly.'}
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusOrderMap[currentStatus] || 1;

  return (
    <div className="py-6">
      <div className="relative">
        {/* Progress Bar Line */}
        <div className={`absolute top-5 left-6 right-6 h-1 -z-0 hidden md:block rounded-full ${
          dark ? 'bg-[#252B35]' : 'bg-gray-200'
        }`}>
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, ((currentStepIndex - 1) / (steps.length - 1)) * 100)
              )}%`,
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const stepIndex = idx + 1;
            const isCompleted = stepIndex <= currentStepIndex;
            const isCurrent = stepIndex === currentStepIndex;
            const StepIcon = step.icon;

            // Find matching event from history
            const historyItem = statusHistory.find((h) => h.status === step.status);

            return (
              <div
                key={step.status}
                className="flex flex-col md:items-center text-left md:text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isCurrent
                      ? dark
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 animate-pulse'
                        : 'bg-emerald-100 border-emerald-500 text-emerald-700 animate-pulse'
                      : dark
                      ? 'bg-[#151922] border-[#252B35] text-[#707887]'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                <div className="mt-2.5">
                  <p
                    className={`text-xs font-bold ${
                      isCompleted || isCurrent
                        ? dark
                          ? 'text-[#F5F7FA]'
                          : 'text-gray-900'
                        : dark
                        ? 'text-[#707887]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {historyItem && (
                    <p className={`text-[10px] mt-0.5 ${dark ? 'text-[#A5ACB8]' : 'text-gray-500'}`}>
                      {new Date(historyItem.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;
