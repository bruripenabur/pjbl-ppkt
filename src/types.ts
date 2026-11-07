export type RoleType = 'lecturer' | 'group1' | 'group2' | 'group3' | 'group4';

export interface GroupInfo {
  id: string;
  number: number;
  name: string;
  focus: string;
  targetChapters: string;
  members: string[];
  description: string;
}

export interface SubmissionItem {
  id: string;
  groupId: string;
  groupName: string;
  week: number;
  targetChapter: string;
  title: string;
  content: string;
  author: string;
  submittedAt: string;
  status: 'Approved' | 'Revision Required' | 'Pending Review';
  rubric: {
    cognitive: { score: number; notes: string };
    creativity: { score: number; notes: string };
    solution: { score: number; notes: string };
  };
  storageTag: string;
  feedback: string;
}

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  assignedGroup: string;
  description: string;
  sections: { code: string; title: string; details: string }[];
}

export interface TimelineWeek {
  week: number;
  phase: string;
  title: string;
  activities: string[];
  output: string;
}

export interface DrillQuestion {
  id: number;
  category: string;
  question: string;
  hint: string;
  expertAnswer: string;
}

export interface AccessRequest {
  id: string;
  fromGroupId: string;
  fromGroupName: string;
  toGroupId: string;
  toGroupName: string;
  title: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface DiscussionMessage {
  id: string;
  forumType: 'general' | 'group';
  groupId?: string; // 'group1' | 'group2' | 'group3' | 'group4'
  author: string;
  role: string;
  message: string;
  createdAt: string;
}

