import React from 'react'

const AddMovie = () => {
  return (
    <div class="container-half-center">
     <h1>Add New Movie</h1>

    <form  id= "NewMovieForm" action="" method="" >
      <fieldset  class="responsive-grid">  <legend>Movie Details</legend>
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" name="title" placeholder="Movie Title" required></input>
        </div>
        <div class="form-group">
          <label for="poster_img">Poster Image URL:</label>
          <input type="file" name="poster_img" accept="image/*" />
          <input type="url" id="poster_img" name="poster_img" placeholder="https://example.com/image.jpg"></input>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" name="description" rows="5" placeholder="Movie description..."></textarea>
        </div>
        <div class="form-group">
          <label for="length">Length (HH:MM:SS):</label>
          <input type="time" id="length" name="length" step="1"></input>
        </div>
        <div class="form-group">
          <label for="age_rating">Age Rating:</label>
          <input type="number" id="age_rating" name="age_rating" min="0" max="21" placeholder="0 ~ 21" required></input>
        </div>
        <div class="form-group">
          <label for="is_team_pick">Team Pick:</label>
          <select id="is_team_pick" name="is_team_pick">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
        <div class="form-group">
          <label for="score">Score :</label>
          <input type="number" id="score" name="score" step="0.1" min="0" max="9.9" placeholder="0.0 ~ 9.9"></input>
        </div>

      </fieldset>

      <div class="button-wrapper">
        <button type="submit" class="btn-primary">Add Movie</button>
      </div>
    </form>
  </div>
  )
}

export default AddMovie