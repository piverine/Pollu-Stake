-- DAO Voting Schema for Pollu-Stake
-- Run this SQL in your NeonDB console to create the DAO voting tables

-- Create dao_proposals table
CREATE TABLE IF NOT EXISTS dao_proposals (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'passed', 'rejected', 'executed'
    votes_for INTEGER NOT NULL DEFAULT 0,
    votes_against INTEGER NOT NULL DEFAULT 0,
    votes_abstain INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create dao_votes table to track individual votes
CREATE TABLE IF NOT EXISTS dao_votes (
    id SERIAL PRIMARY KEY,
    proposal_id VARCHAR(255) NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(50) NOT NULL, -- 'for', 'against', 'abstain'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id), -- Prevent duplicate votes from same user on same proposal
    INDEX idx_proposal_id (proposal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
);

-- Insert sample DAO proposals
INSERT INTO dao_proposals (id, title, description, status, created_by) VALUES
('prop-001', 'Increase Penalty Threshold', 'Proposal to increase the penalty threshold from 200 to 220 AQI', 'active', 'admin'),
('prop-002', 'Reduce Monitoring Interval', 'Proposal to reduce monitoring interval from 3 seconds to 2 seconds', 'active', 'admin'),
('prop-003', 'Increase Slash Amount', 'Proposal to increase slash amount from 10 ETH to 15 ETH for breaches', 'active', 'admin'),
('prop-004', 'Add New Factory', 'Proposal to add a new factory to the monitoring system', 'passed', 'admin'),
('prop-005', 'Update Treasury Distribution', 'Proposal to update treasury fund distribution percentages', 'rejected', 'admin')
ON CONFLICT DO NOTHING;

-- Create a view for proposal statistics
CREATE OR REPLACE VIEW dao_proposal_stats AS
SELECT 
    id,
    title,
    status,
    votes_for,
    votes_against,
    votes_abstain,
    (votes_for + votes_against + votes_abstain) as total_votes,
    CASE 
        WHEN (votes_for + votes_against + votes_abstain) = 0 THEN 0
        ELSE ROUND((votes_for::FLOAT / (votes_for + votes_against + votes_abstain)) * 100, 2)
    END as approval_percentage,
    created_at,
    updated_at
FROM dao_proposals
ORDER BY created_at DESC;

-- Create a view for user voting history
CREATE OR REPLACE VIEW user_voting_history AS
SELECT 
    dv.user_id,
    COUNT(*) as total_votes_cast,
    SUM(CASE WHEN dv.vote_type = 'for' THEN 1 ELSE 0 END) as votes_for_count,
    SUM(CASE WHEN dv.vote_type = 'against' THEN 1 ELSE 0 END) as votes_against_count,
    SUM(CASE WHEN dv.vote_type = 'abstain' THEN 1 ELSE 0 END) as votes_abstain_count,
    MAX(dv.timestamp) as last_vote_timestamp
FROM dao_votes dv
GROUP BY dv.user_id;

-- Verify tables were created
SELECT 'DAO Voting Schema Created Successfully' as status;
