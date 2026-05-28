import { useState, useRef, useEffect } from 'react';
import { HiChevronUpDown, HiCheck, HiMagnifyingGlass } from 'react-icons/hi2';

interface Option {
    id: string;
    label: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select option...',
    className = '',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = query === ''
        ? options
        : options.filter((opt) =>
            opt.label.toLowerCase().includes(query.toLowerCase())
        );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner cursor-pointer"
            >
                <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <HiChevronUpDown className="w-5 h-5 text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-100 relative">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-none rounded-xl focus:ring-0 outline-none font-medium"
                        />
                    </div>
                    <div className="overflow-y-auto p-1 max-h-48">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-xs font-bold text-slate-400">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                                        value === opt.id
                                            ? 'bg-brand-50 text-brand-700 font-black'
                                            : 'text-slate-700 font-semibold hover:bg-slate-50'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.id && <HiCheck className="w-4 h-4 text-brand-600" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
