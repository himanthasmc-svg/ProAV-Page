import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  limit,
  getDocs,
  onSnapshot,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Skill requirement: Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Skill requirement: Test connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection validated successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    } else {
      console.log('[Firebase] Ready (connected to Firestore).');
    }
  }
}
testConnection();

export interface SharedProject {
  id: string;
  name: string;
  author: string;
  rooms: string;
  activeTab?: string;
  notes?: string;
  updatedAt: string;
}

let activeProjectUnsubscribe: Unsubscribe | null = null;
let currentSubscribedProjectId: string | null = null;

export const FirebaseWorkspace = {
  isConfigured: true,
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,

  /**
   * Save a project to Firestore
   */
  async saveProject(project: SharedProject): Promise<SharedProject> {
    const docPath = `shared_projects/${project.id}`;
    try {
      const payload: SharedProject = {
        id: String(project.id).trim(),
        name: String(project.name || 'Untitled AV Design').trim(),
        author: String(project.author || 'AV Engineer').trim(),
        rooms: typeof project.rooms === 'string' ? project.rooms : JSON.stringify(project.rooms || []),
        activeTab: String(project.activeTab || 'Tab1'),
        notes: String(project.notes || ''),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'shared_projects', project.id), payload);
      return payload;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Fetch a project by ID
   */
  async getProject(projectId: string): Promise<SharedProject | null> {
    const docPath = `shared_projects/${projectId}`;
    try {
      const snap = await getDoc(doc(db, 'shared_projects', projectId));
      if (snap.exists()) {
        return snap.data() as SharedProject;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  /**
   * List recent shared projects
   */
  async listRecentProjects(maxCount = 15): Promise<SharedProject[]> {
    const colPath = 'shared_projects';
    try {
      const q = query(collection(db, colPath), limit(maxCount));
      const querySnap = await getDocs(q);
      const list: SharedProject[] = [];
      querySnap.forEach((docSnap) => {
        list.push(docSnap.data() as SharedProject);
      });
      // Sort by updatedAt descending
      list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  },

  /**
   * Delete a project by ID
   */
  async deleteProject(projectId: string): Promise<void> {
    const docPath = `shared_projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'shared_projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  /**
   * Subscribe to real-time updates on a project
   */
  subscribeToProject(
    projectId: string,
    onUpdate: (project: SharedProject) => void,
    onError?: (err: Error) => void
  ): () => void {
    const docPath = `shared_projects/${projectId}`;

    // Clean up existing listener if different
    if (activeProjectUnsubscribe && currentSubscribedProjectId !== projectId) {
      activeProjectUnsubscribe();
      activeProjectUnsubscribe = null;
    }

    currentSubscribedProjectId = projectId;
    const unsub = onSnapshot(
      doc(db, 'shared_projects', projectId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SharedProject;
          onUpdate(data);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, docPath);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );

    activeProjectUnsubscribe = unsub;
    return () => {
      unsub();
      if (activeProjectUnsubscribe === unsub) {
        activeProjectUnsubscribe = null;
        currentSubscribedProjectId = null;
      }
    };
  },

  /**
   * Unsubscribe from current live project
   */
  unsubscribeCurrent(): void {
    if (activeProjectUnsubscribe) {
      activeProjectUnsubscribe();
      activeProjectUnsubscribe = null;
      currentSubscribedProjectId = null;
    }
  },

  getCurrentSubscribedId(): string | null {
    return currentSubscribedProjectId;
  },
};

// Mount onto window for global availability
(window as unknown as { FirebaseWorkspace: typeof FirebaseWorkspace }).FirebaseWorkspace = FirebaseWorkspace;
