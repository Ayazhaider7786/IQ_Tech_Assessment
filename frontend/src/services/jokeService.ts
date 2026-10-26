import axios from 'axios';
import { JOKE_API_URL } from '../config/jokeApi';
import type { JokeResponse } from '../types/joke';

// Uses the raw axios package directly, not apiClient — this is an unrelated
// public API, not our own backend, so apiClient's base URL and JWT header
// attachment both don't apply.
export const jokeService = {
  async getRandomJoke(): Promise<JokeResponse> {
    const response = await axios.get<JokeResponse>(JOKE_API_URL);
    return response.data;
  },
};
