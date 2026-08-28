import type { Marker } from './types';

const DB_NAME = 'reflection-markers';
const DB_VERSION = 1;
const STORE = 'markers';

let promise: Promise<IDBDatabase> | undefined;

function database(): Promise<IDBDatabase> {
  if (promise) return promise;
  promise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage'));
  });
  return promise;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local storage request failed'));
  });
}

export async function getMarkers(): Promise<Marker[]> {
  const db = await database();
  const items = await requestResult(db.transaction(STORE).objectStore(STORE).getAll()) as Marker[];
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveMarker(marker: Marker): Promise<void> {
  const db = await database();
  await requestResult(db.transaction(STORE, 'readwrite').objectStore(STORE).put(marker));
}

export async function deleteMarker(id: string): Promise<void> {
  const db = await database();
  await requestResult(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
}

export async function clearMarkers(): Promise<void> {
  const db = await database();
  await requestResult(db.transaction(STORE, 'readwrite').objectStore(STORE).clear());
}

export async function replaceMarkers(markers: Marker[]): Promise<void> {
  const db = await database();
  const transaction = db.transaction(STORE, 'readwrite');
  transaction.objectStore(STORE).clear();
  for (const marker of markers) transaction.objectStore(STORE).put(marker);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not import markers'));
  });
}
