import { ShieldCheck, Apple, Activity } from 'lucide-react';

export default function RecommendationCard({ parameters }) {

  const low = parameters.filter((p) => p.status === 'Low');
  const high = parameters.filter((p) => p.status === 'High');

  return (
    <div className="recommendation-card">

      <div className="title-row">
        <ShieldCheck color="#22C55E" />
        <h3>Educational Health Recommendations</h3>
      </div>

      {low.length > 0 && (
        <div className="rec-box warning">
          <Apple />
          <div>
            <strong>Parameters Below Range</strong>
            <p>
              {low.map((x) => x.name).join(', ')}
            </p>
            <small>
              Consider discussing these findings with a healthcare professional.
            </small>
          </div>
        </div>
      )}

      {high.length > 0 && (
        <div className="rec-box danger">
          <Activity />
          <div>
            <strong>Parameters Above Range</strong>
            <p>{high.map((x) => x.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="rec-box success">
        <ShieldCheck />
        <div>
          <strong>General Recommendation</strong>
          <p>
            Maintain a balanced diet, hydration, sleep and consult a doctor for abnormal values.
          </p>
        </div>
      </div>

      <small>
        BloodAI provides educational information only and does not replace medical advice.
      </small>

    </div>
  );
}
