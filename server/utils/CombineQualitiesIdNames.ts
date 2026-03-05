import { ScreeningRow, QualityRow } from '../types/database.js';

interface ScreeningWithQualitiesArray extends Omit<ScreeningRow, 'qualities_ids' | 'qualities_names'> {
  qualities: QualityRow[] | null;
}

// Minimal type for what the function actually needs
interface HasQualityFields {
  qualities_ids?: string | null;
  qualities_names?: string | null;
  [key: string]: any; // Allow additional properties
}

type ScreeningWithQualities<T extends HasQualityFields> = Omit<T, 'qualities_ids' | 'qualities_names'> & {
  qualities: QualityRow[] | null;
};

function CombineQualitiesIdNames<T extends HasQualityFields>(
  screenings: T[]
): ScreeningWithQualities<T>[] {
  if (screenings.length === 0) return [];

  return screenings.map((screening) => {
    if (!screening?.qualities_ids || !screening?.qualities_names) {
      const { qualities_ids, qualities_names, ...rest } = screening;
      return { ...rest, qualities: null } as ScreeningWithQualities<T>;
    }
    const ids = screening.qualities_ids.split(';');
    const names = screening.qualities_names.split(';');
    const qualitiesArr: QualityRow[] = ids.map((id: string, i: number) => ({
      quality_id: Number(id),
      quality_name: names[i]
    }));
    const { qualities_ids, qualities_names, ...rest } = screening;
    return { ...rest, qualities: qualitiesArr } as ScreeningWithQualities<T>;
  });
}

export default CombineQualitiesIdNames;
