import React, { useEffect, useState } from 'react';
import { skillAPI } from '../services';
import MentorCard from '../components/mentors/MentorCard';
import { Users, Search, Award } from 'lucide-react';

const MentorDiscoveryPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await skillAPI.searchSkills({ limit: 30 });
        setSkills(res.data.data.skills || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  // Group skills by mentor
  const mentorsMap = new Map();
  skills.forEach((skill) => {
    if (!skill.userId) return;
    const mentorId = skill.userId._id;
    if (!mentorsMap.has(mentorId)) {
      mentorsMap.set(mentorId, {
        mentor: skill.userId,
        skills: []
      });
    }
    mentorsMap.get(mentorId).skills.push(skill);
  });

  const mentorsList = Array.from(mentorsMap.values());

  const filteredMentors = mentorsList.filter((item) => {
    const name = `${item.mentor.firstName} ${item.mentor.lastName}`.toLowerCase();
    const skillsText = item.skills.map((s) => s.title).join(' ').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || skillsText.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Find Peer Mentors</h1>
          <p className="page-subtitle">
            Connect with skilled students ready to coach and tutor you 1-on-1
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="card" style={{ maxWidth: 500 }}>
        <input
          type="text"
          placeholder="Search mentors by name or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : filteredMentors.length > 0 ? (
        <div className="grid-cols-3">
          {filteredMentors.map((item) => (
            <MentorCard
              key={item.mentor._id}
              mentor={item.mentor}
              skills={item.skills}
            />
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <Users size={48} className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h3>No mentors matching your search</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Try searching for a different skill or clearing your keyword filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default MentorDiscoveryPage;
