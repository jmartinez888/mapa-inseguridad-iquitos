'use client'

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  return (
    <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border-2 border-slate-200/60 animate-in fade-in duration-300">
      <label className="flex items-start gap-4 cursor-pointer select-none">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 rounded mt-1 accent-emerald-700 cursor-pointer flex-shrink-0"
        />
        <span className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
          <strong>Acepto participar y autorizo el uso de mis datos compartidos (obligatorio).</strong>
          <br />
          <span className="text-slate-500 block mt-1">
            Confirmo que participo voluntariamente. La información es anónima y será usada para análisis, mapeo y publicación científica sobre seguridad ciudadana en el Perú. Los datos no permiten identificar a la persona. Conforme a la Ley N° 29733 – Protección de Datos Personales.
          </span>
        </span>
      </label>
    </div>
  );
}