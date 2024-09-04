import { CommentData } from '@api/comment.js';

export const commentComparator = (a: CommentData, b: CommentData) => {
    if (a.stime > b.stime) {
        return 2;
    } else if (a.stime < b.stime) {
        return -2;
    } else {
        if (a.date > b.date) {
            return 1;
        } else if (a.date < b.date) {
            return -1;
        } else if (a.dbid != null && b.dbid != null) {
            if (a.dbid > b.dbid) {
                return 1;
            } else if (a.dbid < b.dbid) {
                return -1;
            }
            return 0;
        } else {
            return 0;
        }
    }
};
