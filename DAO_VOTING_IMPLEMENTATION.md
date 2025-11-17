# DAO Voting Implementation - Complete Guide

## Overview
Full backend and frontend integration for DAO proposal voting with database persistence and duplicate vote prevention.

---

## 1. DATABASE SETUP

### SQL Schema File
Location: `backend/DAO_VOTING_SCHEMA.sql`

**Run this SQL in your NeonDB console:**

```sql
-- Create dao_proposals table
CREATE TABLE IF NOT EXISTS dao_proposals (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    votes_for INTEGER NOT NULL DEFAULT 0,
    votes_against INTEGER NOT NULL DEFAULT 0,
    votes_abstain INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create dao_votes table
CREATE TABLE IF NOT EXISTS dao_votes (
    id SERIAL PRIMARY KEY,
    proposal_id VARCHAR(255) NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id),
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
);

-- Insert sample proposals
INSERT INTO dao_proposals (id, title, description, status, created_by) VALUES
('prop-001', 'Increase Penalty Threshold', 'Proposal to increase the penalty threshold from 200 to 220 AQI', 'active', 'admin'),
('prop-002', 'Reduce Monitoring Interval', 'Proposal to reduce monitoring interval from 3 seconds to 2 seconds', 'active', 'admin'),
('prop-003', 'Increase Slash Amount', 'Proposal to increase slash amount from 10 ETH to 15 ETH for breaches', 'active', 'admin'),
('prop-004', 'Add New Factory', 'Proposal to add a new factory to the monitoring system', 'passed', 'admin'),
('prop-005', 'Update Treasury Distribution', 'Proposal to update treasury fund distribution percentages', 'rejected', 'admin')
ON CONFLICT DO NOTHING;
```

---

## 2. BACKEND CHANGES

### File: `backend/main.py`

**Added Pydantic Model:**
```python
class DAOVoteRequest(BaseModel):
    proposalId: str
    userId: str
    voteType: str  # 'for', 'against', 'abstain'
    timestamp: str = ""
    
    class Config:
        extra = "allow"
```

**New Endpoints:**

1. **POST /api/dao-vote** - Submit a vote
   - Validates user hasn't voted before
   - Records vote in database
   - Updates proposal vote counts
   - Returns 400 if duplicate vote

2. **GET /api/dao-proposals** - Fetch all proposals
   - Returns proposals with current vote counts
   - Ordered by creation date

3. **GET /api/user-votes/{user_id}** - Fetch user's votes
   - Returns all votes cast by a user
   - Includes proposal ID, vote type, and timestamp

---

## 3. FRONTEND CHANGES

### File: `frontend/src/app/admin/governance/page.tsx`

**Key Updates:**

1. **State Management:**
   - Added `isLoading` and `isVoting` states
   - Fetch proposals from backend on mount
   - Fetch user votes from backend when user logs in

2. **Vote Handling:**
   - `handleVote()` now calls backend API
   - Prevents duplicate votes with database constraint
   - Shows error if user tries to vote twice
   - Updates local state after successful vote

3. **UI Improvements:**
   - Voting buttons disabled while voting
   - Loading state shown during submission
   - Green confirmation box shows user's vote
   - Error messages from backend displayed

**API Calls:**
- `GET http://localhost:8000/api/dao-proposals`
- `POST http://localhost:8000/api/dao-vote`
- `GET http://localhost:8000/api/user-votes/{userId}`

---

## 4. FEATURES

✅ **Duplicate Vote Prevention**
- Database UNIQUE constraint on (proposal_id, user_id)
- Backend validation before insert
- Frontend prevents UI interaction after voting

✅ **Vote Tracking**
- Each vote stored with user ID, proposal ID, vote type, timestamp
- User can see all their votes
- Proposals show real-time vote counts

✅ **Error Handling**
- Clear error messages for duplicate votes
- Validation of vote types ('for', 'against', 'abstain')
- Proper HTTP status codes

✅ **Real-time Updates**
- Vote counts update immediately on frontend
- Backend persists all votes to database
- User votes fetched on page load

---

## 5. WORKFLOW

1. **User navigates to Governance page**
   - Frontend fetches all proposals from backend
   - Frontend fetches user's previous votes

2. **User clicks vote button**
   - Frontend sends POST request to `/api/dao-vote`
   - Backend checks for duplicate vote
   - Backend inserts vote into database
   - Backend updates proposal vote counts

3. **Vote recorded**
   - Frontend shows confirmation
   - Vote buttons hidden
   - Vote count updated in real-time

4. **User tries to vote again**
   - Frontend shows error: "You have already voted"
   - Backend returns 400 with error message

---

## 6. TESTING

### Test Duplicate Vote Prevention
1. Sign in as user
2. Click "Vote For" on a proposal
3. Try to click "Vote Against" on same proposal
4. Should see error: "You have already voted on this proposal"

### Test Vote Persistence
1. Vote on a proposal
2. Refresh the page
3. Vote should still show as "You voted: [type]"

### Test Vote Counts
1. Vote on a proposal
2. Check that vote count increments in real-time
3. Refresh page - vote count should persist

---

## 7. DATABASE QUERIES

**Get all votes for a proposal:**
```sql
SELECT user_id, vote_type, timestamp 
FROM dao_votes 
WHERE proposal_id = 'prop-001' 
ORDER BY timestamp DESC;
```

**Get user's voting history:**
```sql
SELECT proposal_id, vote_type, timestamp 
FROM dao_votes 
WHERE user_id = 'user_123' 
ORDER BY timestamp DESC;
```

**Get proposal statistics:**
```sql
SELECT * FROM dao_proposal_stats;
```

---

## 8. DEPLOYMENT CHECKLIST

- [ ] Run SQL schema in NeonDB console
- [ ] Restart backend server
- [ ] Refresh frontend in browser
- [ ] Test voting on governance page
- [ ] Verify votes persist in database
- [ ] Test duplicate vote prevention
- [ ] Check error messages display correctly

---

## 9. TROUBLESHOOTING

**Votes not saving:**
- Check backend logs for errors
- Verify database tables exist
- Ensure backend is running on port 8000

**Duplicate votes allowed:**
- Check UNIQUE constraint exists in database
- Verify backend validation is working
- Check browser console for errors

**Votes not loading:**
- Check user ID is being passed correctly
- Verify backend endpoint is accessible
- Check CORS configuration

---

## 10. FUTURE ENHANCEMENTS

- Add vote weight based on stake amount
- Implement time-locked voting periods
- Add proposal creation UI
- Add voting analytics dashboard
- Implement delegation voting
- Add vote escrow for governance tokens
