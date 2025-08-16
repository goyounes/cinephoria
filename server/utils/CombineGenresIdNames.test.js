import CombineGenresIdNames from './CombineGenresIdNames.js'

describe('CombineGenresIdNames', () => {
  test('should handle empty input', () => {
    expect(CombineGenresIdNames([])).toEqual([])
    expect(CombineGenresIdNames(null)).toEqual([])
    expect(CombineGenresIdNames(undefined)).toEqual([])
  })

  test('should combine genres correctly', () => {
    const movies = [{
      id: 1,
      title: 'Test Movie',
      genres_ids: '1;2;3',
      genres_names: 'Action;Comedy;Drama'
    }]

    const result = CombineGenresIdNames(movies)
    
    expect(result[0].genres).toEqual([
      { genre_id: 1, genre_name: 'Action' },
      { genre_id: 2, genre_name: 'Comedy' },
      { genre_id: 3, genre_name: 'Drama' }
    ])
    expect(result[0].title).toBe('Test Movie')
    expect(result[0].id).toBe(1)
  })

  test('should handle missing genres', () => {
    const movies = [{ id: 1, title: 'Test Movie' }]
    const result = CombineGenresIdNames(movies)
    expect(result[0].genres).toBe(null)
    expect(result[0].title).toBe('Test Movie')
    expect(result[0].id).toBe(1)
  })

  test('should handle single genre', () => {
    const movies = [{
      id: 1,
      title: 'Action Movie',
      genres_ids: '1',
      genres_names: 'Action'
    }]

    const result = CombineGenresIdNames(movies)
    expect(result[0].genres).toEqual([
      { genre_id: 1, genre_name: 'Action' }
    ])
  })

  test('should handle multiple movies', () => {
    const movies = [
      {
        id: 1,
        title: 'Movie 1',
        genres_ids: '1;2',
        genres_names: 'Action;Comedy'
      },
      {
        id: 2,
        title: 'Movie 2',
        genres_ids: '3',
        genres_names: 'Drama'
      }
    ]

    const result = CombineGenresIdNames(movies)
    expect(result).toHaveLength(2)
    expect(result[0].genres).toHaveLength(2)
    expect(result[1].genres).toHaveLength(1)
  })

  test('should handle empty genres_ids or genres_names', () => {
    const movies = [
      { id: 1, genres_ids: '', genres_names: 'Action' },
      { id: 2, genres_ids: '1', genres_names: '' },
      { id: 3, genres_ids: null, genres_names: 'Action' },
      { id: 4, genres_ids: '1', genres_names: null }
    ]

    const result = CombineGenresIdNames(movies)
    result.forEach(movie => {
      expect(movie.genres).toBe(null)
    })
  })
})