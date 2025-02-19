import React, { forwardRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import subDays from 'date-fns/subDays';
import { useRouter } from 'next/router';
import { Filter, Calendar, Share } from 'react-feather';
import Button from './Button';

const DateButton = forwardRef<
  HTMLButtonElement,
  { onClick?: any; value?: string; loading?: boolean }
>(({ onClick, value, loading }, ref) => (
  <Button ref={ref} onClick={onClick} Icon={Calendar}>
    {loading ? <div className="loader" /> : value || 'Yesterday'}

    <style jsx>{`
      .loader {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 0 10px;
      }
      .loader:after {
        content: ' ';
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid #333;
        border-color: #333 transparent #333 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </Button>
));

interface ToolbarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  onFilterToggle?: () => void;
  numFilters?: number;
  onShare?: () => void;
  tags: { id: string; label: string }[];
  onTagRemoved: (tag: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  date,
  onDateChange,
  onFilterToggle,
  numFilters,
  onShare,
  tags,
  onTagRemoved,
}) => {
  const router = useRouter();
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (changed) {
      const startLoading = () => setLoading(true);
      const stopLoading = () => {
        setLoading(false);
        setChanged(false);
      };

      router.events.on('routeChangeStart', startLoading);
      router.events.on('routeChangeComplete', stopLoading);
      router.events.on('routeChangeError', stopLoading);

      return () => {
        router.events.off('routeChangeStart', startLoading);
        router.events.off('routeChangeComplete', stopLoading);
        router.events.off('routeChangeError', stopLoading);
      };
    }
  }, [changed]);

  return (
    <div className="toolbar">
      {tags.map((tag: any) => (
        <div key={tag.id} className="label" title={tag.label}>
          <span>{tag.label}</span>
          <button onClick={() => onTagRemoved(tag.id)}>×</button>
        </div>
      ))}

      <Button onClick={onShare} Icon={Share}>
        Share
      </Button>

      <Button onClick={onFilterToggle} Icon={Filter}>
        Filters
        {numFilters > 0 && <span className="chip">{numFilters}</span>}
      </Button>

      {onDateChange && (
        <DatePicker
          selected={date}
          customInput={<DateButton loading={loading && changed} />}
          onChange={(newDate: any) => {
            setChanged(true);
            onDateChange(newDate);
          }}
          maxDate={subDays(new Date(), 1)}
          popperPlacement="bottom-end"
        />
      )}

      <style jsx>{`
        .toolbar {
          display: flex;
          justify-content: flex-end;
          align-self: stretch;
        }
        .toolbar > :global(*) {
          margin-left: 4px;
        }
        .chip {
          background: #828282;
          color: #f9fafc;
          border-radius: 6px;
          font-size: 10px;
          padding: 2px 4px;
          margin-left: 6px;
        }
        .label {
          font-size: 10px;
          display: flex;
          max-width: 150px;
          align-items: center;
          background: #eeeeee;
          padding: 2px;
          border-radius: 4px;
        }
        .label span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .label button {
          margin-left: 4px;
          background: transparent;
          border: none;
          outline: none;
          padding: 4px;
        }
        .label button:hover {
          background: #dedede;
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
