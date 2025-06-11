import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // 1. Use Appwrite SDK to check if the search term exists in the database
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    // 2. If it does, update the count
    if (result.documents.length > 0) {
      const doc = result.documents[0];

      const updatedDoc = await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        {
          count: Number(doc.count) + 1,
        }
      );
      console.log("Update successful:", updatedDoc);
      // 3. If it doesn't, create a new document with the search term and count as 1
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        movie_id: movie.id,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getTrendingMovies = async () => {
  try {
    // Fetch a larger pool of trending movies (top 20 by count)
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(20), // Larger pool for randomization
      Query.orderDesc("count"),
    ]);

    const documents = result.documents;

    // If fewer than 5 documents, return all shuffled
    if (documents.length <= 5) {
      // Shuffle the array using Fisher-Yates algorithm
      for (let i = documents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [documents[i], documents[j]] = [documents[j], documents[i]];
      }
      return documents;
    }

    // Randomly select 5 documents
    const shuffled = [];
    const indices = new Set();
    while (indices.size < 5) {
      const randomIndex = Math.floor(Math.random() * documents.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        shuffled.push(documents[randomIndex]);
      }
    }

    return shuffled;
  } catch (error) {
    console.error('Error fetching trending movies:', error.message);
  }
};