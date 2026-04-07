import React, { useEffect, useState } from 'react';
import { userPortalAPI } from '../../api';
import UserLayout from '../../components/user/UserLayout';
import styles from './UserCommon.module.css';

const UserAssessments = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [quizState, setQuizState] = useState({
    open: false,
    item: null,
    answers: [],
    submitting: false
  });

  const fetchAssessments = async () => {
    try {
      const response = await userPortalAPI.getAssessments();
      setItems(response.data.data || []);
    } catch (err) {
      setError('Unable to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const openQuiz = (item) => {
    const total = item.quizQuestions?.length || 10;
    setQuizState({
      open: true,
      item,
      answers: Array(total).fill(null),
      submitting: false
    });
    setInfo('');
    setError('');
  };

  const closeQuiz = () => {
    if (quizState.submitting) return;
    setQuizState({ open: false, item: null, answers: [], submitting: false });
  };

  const setAnswer = (index, optionIndex) => {
    setQuizState((prev) => ({
      ...prev,
      answers: prev.answers.map((value, idx) => (idx === index ? optionIndex : value))
    }));
  };

  const submitQuiz = async () => {
    if (!quizState.item) return;
    const unanswered = quizState.answers.some((answer) => answer === null);
    if (unanswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setQuizState((prev) => ({ ...prev, submitting: true }));
    setError('');
    setInfo('');
    try {
      const response = await userPortalAPI.submitAssessmentQuiz(quizState.item.id, {
        answers: quizState.answers
      });
      const result = response.data.data;
      setInfo(`Test submitted. Score: ${result.score}%. ${result.passed ? 'You passed the test.' : 'You did not clear the test.'}`);
      setQuizState({ open: false, item: null, answers: [], submitting: false });
      setLoading(true);
      await fetchAssessments();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit assessment');
      setQuizState((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <UserLayout currentPage="/user/assessments" pageTitle="Test Updates">
      {error && <div className={styles.alert}>{error}</div>}
      {info && <div className={styles.info}>{info}</div>}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <section className={styles.card}>
          <h3>Test Updates</h3>
          {!items.length ? (
            <p className={styles.empty}>No assessments assigned yet. Manager test updates will appear here.</p>
          ) : (
            <div className={styles.list}>
              {items.map((item) => (
                <div className={styles.item} key={item.id}>
                  <p className={styles.itemTitle}>{item.jobTitle}</p>
                  <p className={styles.itemSub}>{item.companyName}</p>
                  {item.testLink && (
                    <p className={styles.itemMeta}>
                      Test Link:{' '}
                      <a href={item.testLink} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                        Open Test Link
                      </a>
                    </p>
                  )}
                  <p className={styles.itemMeta}>Pass Criteria: {item.passPercentage || 75}%</p>
                  {item.testAttempted ? (
                    <p className={styles.itemMeta}>
                      Score: {item.testScore ?? 'N/A'}% - {item.testPassed ? 'Passed' : 'Not Cleared'}
                    </p>
                  ) : (
                    <p className={styles.itemMeta}>Attempt Allowed: Once</p>
                  )}
                  {item.interviewCalled && <p className={styles.itemMeta}>Interview call sent. Check Interviews section.</p>}
                  {item.notes && <p className={styles.itemMeta}>Notes: {item.notes}</p>}
                  {item.updatedAt && (
                    <p className={styles.itemMeta}>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                  )}
                  <div className={styles.rowActions}>
                    <span className={`${styles.badge} ${item.testPassed ? styles.passBadge : ''}`}>
                      {item.status.replaceAll('_', ' ')}
                    </span>
                    {item.canTakeTest && (
                      <button type="button" className={styles.actionBtn} onClick={() => openQuiz(item)}>
                        Start 10-Question Test
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {quizState.open && quizState.item && (
        <div className={styles.modalBackdrop} onClick={closeQuiz}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{quizState.item.jobTitle} - Online Test</h3>
            <p className={styles.itemMeta}>Attempt allowed once. Pass mark: {quizState.item.passPercentage || 75}%</p>
            <div className={styles.quizList}>
              {(quizState.item.quizQuestions || []).map((question, qIndex) => (
                <div key={question.id} className={styles.quizCard}>
                  <p className={styles.quizQ}>{qIndex + 1}. {question.question}</p>
                  <div className={styles.quizOptions}>
                    {question.options.map((option, optionIndex) => (
                      <label key={`${question.id}-${optionIndex}`} className={styles.optionRow}>
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          checked={quizState.answers[qIndex] === optionIndex}
                          onChange={() => setAnswer(qIndex, optionIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={closeQuiz} disabled={quizState.submitting}>Cancel</button>
              <button type="button" className={styles.actionBtn} onClick={submitQuiz} disabled={quizState.submitting}>
                {quizState.submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserAssessments;
