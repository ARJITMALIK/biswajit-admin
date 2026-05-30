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
    size?: 'sm' | 'md';
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select option...',
    className = '',
    size = 'md',
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

    const isSm = size === 'sm';

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between outline-none transition-all font-bold shadow-inner cursor-pointer ${
                    isSm
                        ? 'px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white text-xs'
                        : 'px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white text-sm'
                }`}
            >
                <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <HiChevronUpDown className={`${isSm ? 'w-4 h-4' : 'w-5 h-5'} text-slate-400`} />
            </button>

            {isOpen && (
                <div className={`absolute z-[110] w-full mt-1.5 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
                    isSm ? 'rounded-lg max-h-48' : 'rounded-2xl max-h-60'
                }`}>
                    <div className={`${isSm ? 'p-1.5' : 'p-2'} border-b border-slate-100 relative`}>
                        <HiMagnifyingGlass className={`absolute ${isSm ? 'left-3 w-3.5 h-3.5' : 'left-4 w-4 h-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`w-full bg-slate-50 border-none focus:ring-0 outline-none font-medium ${
                                isSm ? 'pl-8 pr-2.5 py-1 text-xs rounded-lg' : 'pl-9 pr-3 py-2 text-sm rounded-xl'
                            }`}
                        />
                    </div>
                    <div className={`overflow-y-auto p-1 ${isSm ? 'max-h-36' : 'max-h-48'}`}>
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
                                    className={`w-full text-left transition-all flex items-center justify-between ${
                                        isSm ? 'px-3 py-1.5 rounded-lg text-xs' : 'px-4 py-2.5 rounded-xl text-sm'
                                    } ${
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
