// groom_about.jsx
import groomData from "../config/groom_details.json";
import "./groom_about.css";

const Field = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="ga-field">
      <span className="ga-field-icon">{icon}</span>
      <div className="ga-field-body">
        <span className="ga-field-label">{label}</span>
        <span className="ga-field-value">{value}</span>
      </div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="ga-card">
    <div className="ga-card-header">
      <span className="ga-card-title">{title}</span>
    </div>
    <div className="ga-card-body">{children}</div>
  </div>
);

const GroomAbout = () => {
  const g = groomData;
  const phone = g.fatherContact;

  const waMessage = encodeURIComponent(
    `Namaste 🙏,\n\nI came across the matrimonial profile of *${g.name} ${g.surname}* and I am interested in knowing more details.\n\nKindly share the full profile and family details at your convenience.\n\nThank you.`
  );

  return (
    <section className="ga-section">
      <div className="ga-grid">

        <Card title="🪐 Astrological Details">
          <Field icon="📅" label="Date of Birth" value={g.dob} />
          <Field icon="🕐" label="Birth Time" value={g.time} />
          <Field icon="⭐" label="Star (Nakshatra)" value={g.star} />
          <Field icon="♈" label="Rasi" value={g.rasi} />
          <Field icon="🔯" label="Lagnam" value={g.lagnam} />
          <Field icon="🧬" label="Gotram" value={g.gotram} />
        </Card>

        <Card title="👤 Personal Details">
          <Field icon="🪪" label="Full Name" value={`${g.name} ${g.surname}`} />
          <Field icon="🏷️" label="Surname" value={g.surname} />
          <Field icon="📏" label="Height" value={g.height} />
          <Field icon="💼" label="Occupation" value={g.occupation} />
          <Field icon="🎓" label="Qualification" value={g.qualification} />
          <Field icon="📍" label="Location" value={g.location} />
          <Field icon="👫" label="Siblings" value={g.siblings} />
        </Card>

        <Card title="👨‍👩‍👦 Family Details">
          <Field icon="👨" label="Father's Name" value={g.fatherName} />
          <Field icon="💼" label="Father's Occupation" value={g.fatherOccupation} />
          <Field icon="👩" label="Mother's Name" value={g.motherName} />
          <Field icon="🏠" label="Mother's Occupation" value={g.motherOccupation} />
        </Card>

      </div>

      {phone && (
        <div className="ga-contact-block">
          <p className="ga-contact-label">📞 Contact — Father of the Groom</p>
          <p className="ga-contact-number">{phone}</p>
          <div className="ga-contact-btns">
            <a
              href={`tel:${phone}`}
              className="ga-btn ga-btn-call"
            >
              📞 Call Now
            </a>

            <a
              href={`https://wa.me/91${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ga-btn ga-btn-whatsapp"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default GroomAbout;