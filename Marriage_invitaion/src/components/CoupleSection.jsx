/* src/components/CoupleSection.jsx */
import { motion } from 'framer-motion';
import './CoupleSection.css';

const placeholder = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=2d1b00&color=d4af37&font-size=0.33&bold=true`;

const CoupleCard = ({ name, role, image, parents, delay, isMarriage }) => (
  <motion.div
    className={`couple-card ${isMarriage ? 'marriage' : 'engagement'}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ y: -8, scale: 1.02 }}
  >
    <div className="card-img-wrap">
      <img
        src={image || placeholder(name)}
        alt={name}
        className="card-img"
        onError={(e) => { e.target.src = placeholder(name); }}
      />
      <div className="card-img-ring" />
    </div>
    <div className="card-body">
      <span className="card-role">{role}</span>
      <h3 className="card-name">{name}</h3>
      <p className="card-parents">{parents}</p>
    </div>
  </motion.div>
);

const CoupleSection = ({ data }) => {
  const isMarriage = data.invitationType === 'Marriage';

  return (
    <section className={`couple-section ${isMarriage ? 'marriage' : 'engagement'}`}>
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">♡ The Couple ♡</p>
          <h2 className="section-title">
            {data.brideName} &amp; {data.groomName}
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div className="couple-cards">
          <CoupleCard
            name={data.brideName}
            role={isMarriage ? 'The Bride' : 'The Bride-To-Be'}
            image={data.brideImage}
            parents={data.parents.brideParents}
            delay={0.2}
            isMarriage={isMarriage}
          />

          <motion.div
            className="couple-heart"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isMarriage ? '💍' : '💎'}
          </motion.div>

          <CoupleCard
            name={data.groomName}
            role={isMarriage ? 'The Groom' : 'The Groom-To-Be'}
            image={data.groomImage}
            parents={data.parents.groomParents}
            delay={0.4}
            isMarriage={isMarriage}
          />
        </div>

        {data.dressCode && (
          <motion.div
            className={`dress-code-badge ${isMarriage ? 'marriage' : 'engagement'}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            👗 Dress Code: {data.dressCode}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CoupleSection;