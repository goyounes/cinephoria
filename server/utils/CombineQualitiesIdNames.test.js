import CombineQualitiesIdNames from './CombineQualitiesIdNames.js'

describe('CombineQualitiesIdNames', () => {
  test('should handle empty input', () => {
    expect(CombineQualitiesIdNames([])).toEqual([])
    expect(CombineQualitiesIdNames(null)).toEqual([])
    expect(CombineQualitiesIdNames(undefined)).toEqual([])
  })

  test('should combine qualities correctly', () => {
    const screenings = [{
      id: 1,
      movie_title: 'Test Movie',
      qualities_ids: '1;2;3',
      qualities_names: '4DX;3D;4K'
    }]

    const result = CombineQualitiesIdNames(screenings)
    
    expect(result[0].qualities).toEqual([
      { quality_id: 1, quality_name: '4DX' },
      { quality_id: 2, quality_name: '3D' },
      { quality_id: 3, quality_name: '4K' }
    ])
    expect(result[0].movie_title).toBe('Test Movie')
    expect(result[0].id).toBe(1)
  })

  test('should handle missing qualities', () => {
    const screenings = [{ id: 1, movie_title: 'Test Movie' }]
    const result = CombineQualitiesIdNames(screenings)
    expect(result[0].qualities).toBe(null)
    expect(result[0].movie_title).toBe('Test Movie')
  })

  test('should handle single quality', () => {
    const screenings = [{
      id: 1,
      movie_title: '4DX Movie',
      qualities_ids: '1',
      qualities_names: '4DX'
    }]

    const result = CombineQualitiesIdNames(screenings)
    expect(result[0].qualities).toEqual([
      { quality_id: 1, quality_name: '4DX' }
    ])
  })

  test('should handle multiple screenings', () => {
    const screenings = [
      {
        id: 1,
        movie_title: 'Movie 1',
        qualities_ids: '1;3',
        qualities_names: '4DX;4K'
      },
      {
        id: 2,
        movie_title: 'Movie 2',
        qualities_ids: '2',
        qualities_names: '3D'
      }
    ]

    const result = CombineQualitiesIdNames(screenings)
    expect(result).toHaveLength(2)
    expect(result[0].qualities).toHaveLength(2)
    expect(result[1].qualities).toHaveLength(1)
  })

  test('should handle all quality types at once', () => {
    const screenings = [{
      id: 1,
      movie_title: 'Premium Movie',
      qualities_ids: '1;2;3;4',
      qualities_names: '4DX;3D;4K;FHD'
    }]

    const result = CombineQualitiesIdNames(screenings)
    expect(result[0].qualities).toEqual([
      { quality_id: 1, quality_name: '4DX' },
      { quality_id: 2, quality_name: '3D' },
      { quality_id: 3, quality_name: '4K' },
      { quality_id: 4, quality_name: 'FHD' }
    ])
  })

  test('should handle empty qualities_ids or qualities_names', () => {
    const screenings = [
      { id: 1, qualities_ids: '', qualities_names: '4DX' },
      { id: 2, qualities_ids: '1', qualities_names: '' },
      { id: 3, qualities_ids: null, qualities_names: '3D' },
      { id: 4, qualities_ids: '2', qualities_names: null }
    ]

    const result = CombineQualitiesIdNames(screenings)
    result.forEach(screening => {
      expect(screening.qualities).toBe(null)
    })
  })
})