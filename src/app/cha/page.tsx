import Bodysuit from '@/components/Bodysuit';
import Bunting from '@/components/Bunting';
import Heart from '@/components/Heart';
import Balloons from '@/components/Balloons';
import RSVPForm from '@/components/RSVPForm';
import './page.css';

export default function Home() {
  return (
    <main className="invitation-container">
      {/* Background watercolor effect via CSS */}
      <div className="watercolor-bg"></div>
      <div className="gold-dust-bg"></div>
      
      <div className="bunting-wrapper">
         <Bunting />
      </div>

      <div className="center-stage">
        <div className="balloons-left animate-float">
          <Balloons side="left" />
        </div>
        
        <div className="bodysuits">
          <Bodysuit color="var(--color-terracotta)" name="AURORA" isLeft={true} />
          <div className="heart-wrapper animate-pulse-gentle">
            <Heart />
          </div>
          <Bodysuit color="var(--color-tan)" name="OTTO" isLeft={false} />
        </div>

        <div className="balloons-right animate-float-delay">
          <Balloons side="right" />
        </div>
      </div>

      <div className="details">
        <h2 className="cursive question">Menina ou menino?</h2>
        
        <div className="date-time-block">
          <div className="day-name">SÁBADO</div>
          <div className="divider-h"></div>
          <div className="month-day">
            <span className="month">AGOSTO</span>
            <span className="day">08</span>
            <span className="year">2026</span>
          </div>
          <div className="divider-h"></div>
          <div className="time">13H</div>
        </div>

        <p className="address">Alameda dos Coqueiros, 7 - Bandeirinhas, Betim</p>
        
        <a href="https://maps.app.goo.gl/AXGtTh7AmqtRvR6f6" target="_blank" rel="noopener noreferrer" className="location-btn">
          O Casarão Restaurante
        </a>

        <RSVPForm />
      </div>
    </main>
  );
}
