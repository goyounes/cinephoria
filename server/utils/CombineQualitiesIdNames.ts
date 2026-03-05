import { ScreeningRow, QualityRow } from '../types/database.js';

interface ScreeningWithQualitiesArray extends Omit<ScreeningRow, 'qualities_ids' | 'qualities_names'> {
  qualities: QualityRow[] | null;
}

function CombineQualitiesIdNames(screenings: ScreeningRow[]): ScreeningWithQualitiesArray[] {
  if (!screenings || screenings?.length === 0) return [];

  return screenings.map((screening) => {
    if (!screening?.qualities_ids || !screening?.qualities_names) {
      const { qualities_ids, qualities_names, ...rest } = screening;
      return { ...rest, qualities: null };
    }
    const ids = screening.qualities_ids.split(';');
    const names = screening.qualities_names.split(';');
    const qualitiesArr = ids.map((id, i) => ({
      quality_id: Number(id),
      quality_name: names[i]
    }));
    const { qualities_ids, qualities_names, ...rest } = screening;
    return { ...rest, qualities: qualitiesArr };
  });
}

export default CombineQualitiesIdNames;
