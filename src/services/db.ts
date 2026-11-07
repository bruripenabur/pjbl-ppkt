import { SubmissionItem, AccessRequest, DiscussionMessage } from '../types';
import { INITIAL_SUBMISSIONS } from '../data/curriculumData';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxpRjAfcA3cB1t8dzXNiRQoGFT39Ul5hgGyf7AbuCDADUwJE5l4LiDqs8aRz1rgq9YBxg/exec';
const STORAGE_KEY = 'pjbl_ppkt_submissions_v1';
const REQUESTS_STORAGE_KEY = 'pjbl_ppkt_access_requests_v1';
const DISCUSSIONS_STORAGE_KEY = 'pjbl_ppkt_discussions_v1';

const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [];

const INITIAL_DISCUSSIONS: DiscussionMessage[] = [];

// Database service connected to Google Sheets & LocalStorage
export const dbService = {
  async getSubmissions(): Promise<SubmissionItem[]> {
    try {
      const response = await fetch(GAS_URL);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as SubmissionItem[];
      }
    } catch (e) {
      console.warn('Google Sheets fetch fallback to localStorage:', e);
    }

    // Fallback to localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (err) {
        console.error('Error parsing local submissions:', err);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
    return INITIAL_SUBMISSIONS;
  },

  async saveSubmission(newSub: SubmissionItem): Promise<SubmissionItem[]> {
    let current = await this.getSubmissions();
    const updated = [newSub, ...current];

    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', submission: newSub })
      });
    } catch (e) {
      console.warn('Google Sheets save fallback to localStorage:', e);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pjbl_db_update', { detail: updated }));
    return updated;
  },

  async updateSubmissionStatus(id: string, status: 'Approved' | 'Revision Required'): Promise<SubmissionItem[]> {
    let current = await this.getSubmissions();
    const updated = current.map(s => s.id === id ? {
      ...s,
      status,
      storageTag: s.storageTag.replace(/Status: (Approved|Revision Required|Pending Review)/, `Status: ${status}`)
    } : s);

    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', id, status })
      });
    } catch (e) {
      console.warn('Google Sheets update status fallback to localStorage:', e);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pjbl_db_update', { detail: updated }));
    return updated;
  },

  // Access Requests management
  async getAccessRequests(): Promise<AccessRequest[]> {
    const local = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing access requests:', e);
      }
    }
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCESS_REQUESTS));
    return INITIAL_ACCESS_REQUESTS;
  },

  async saveAccessRequest(newReq: AccessRequest): Promise<AccessRequest[]> {
    const current = await this.getAccessRequests();
    const updated = [newReq, ...current];
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pjbl_requests_update', { detail: updated }));
    return updated;
  },

  async updateAccessRequestStatus(id: string, status: 'Approved' | 'Rejected'): Promise<AccessRequest[]> {
    const current = await this.getAccessRequests();
    const updated = current.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pjbl_requests_update', { detail: updated }));
    return updated;
  },

  // Discussion Messages management
  async getDiscussionMessages(): Promise<DiscussionMessage[]> {
    const local = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing discussion messages:', e);
      }
    }
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(INITIAL_DISCUSSIONS));
    return INITIAL_DISCUSSIONS;
  },

  async saveDiscussionMessage(msg: DiscussionMessage): Promise<DiscussionMessage[]> {
    const current = await this.getDiscussionMessages();
    const updated = [...current, msg];
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pjbl_discussions_update', { detail: updated }));
    return updated;
  },

  // Polling subscriber wrapper
  subscribeToSubmissions(onUpdate: (submissions: SubmissionItem[]) => void) {
    const interval = setInterval(async () => {
      try {
        const fresh = await this.getSubmissions();
        onUpdate(fresh);
      } catch (e) {
        // ignore polling network error
      }
    }, 15000);

    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        onUpdate(customEvent.detail);
      }
    };
    window.addEventListener('pjbl_db_update', handleLocalUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pjbl_db_update', handleLocalUpdate);
    };
  }
};
