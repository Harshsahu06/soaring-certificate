import React from 'react';
import logo from "../assets/soaring-logo.png";

const SkillTestReportPDF = React.forwardRef(({ candidate, testDetails }, ref) => {
  if (!candidate || !testDetails) return null;

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      <div ref={ref} className="skill-report-wrapper" style={{
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        margin: '0',
        padding: '30px 40px',
        fontSize: '14px',
        lineHeight: '1.4',
        width: '100%',
        maxWidth: '800px',
        boxSizing: 'border-box'
      }}>
        <style>
          {`
            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .skill-report-wrapper { page-break-inside: avoid; padding: 20mm 20mm 15mm 20mm; box-sizing: border-box; }
            }
            .table-bordered { width: 100%; border-collapse: collapse; }
            .table-bordered th, .table-bordered td { border: 1px solid #000; padding: 6px 10px; }
            .header-table td { text-align: center; }
          `}
        </style>

        {/* Header Table */}
        <table className="table-bordered header-table" style={{ marginBottom: '30px' }}>
          <tbody>
            <tr>
              <td rowSpan="2" style={{ width: '20%', padding: '10px' }}>
                <img src={logo} alt="Soaring Logo" style={{ width: '80px', height: 'auto' }} onError={(e) => e.target.style.display = 'none'} />
              </td>
              <td rowSpan="2" style={{ width: '50%', fontWeight: 'bold', fontSize: '18px', padding: '15px 10px' }}>
                RPAS TRAINING AND<br/>PROCEDURES MANUAL
                <div style={{ fontSize: '13px', fontWeight: 'normal', marginTop: '10px' }}>SOARING AEROTECH<br/>PRIVATE LIMITED</div>
              </td>
              <td style={{ width: '30%', fontWeight: 'bold', fontSize: '14px' }}>
                SAPL/RPAS/TPM
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: '13px' }}>ISSUE-1 Rev.0<br/><br/>Aug 2023</td>
            </tr>
          </tbody>
        </table>

        {/* Title */}
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '25px', marginTop: '15px' }}>
          SKILL TEST REPORT: RPAS
        </div>

        {/* Form Details Table */}
        <table className="table-bordered" style={{ marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td colSpan="2">
                Name of the trainee: &nbsp;&nbsp; <strong>{candidate.fullName.toUpperCase()}</strong>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                Name of the Instructor: &nbsp;&nbsp; <strong>{testDetails.instructor.toUpperCase()}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ width: '50%' }}>
                Skill test by {testDetails.dayNight}
              </td>
              <td style={{ width: '50%' }}>
                Type: {['Fixed Wing', 'RotaryWing', 'Other'].map((t, i) => (
                  <span key={t}>
                    {testDetails.type === t ? <u><strong>{t}</strong></u> : t}
                    {i < 2 ? ' / ' : ''}
                  </span>
                ))}
              </td>
            </tr>
            <tr>
              <td>
                Date of the test: &nbsp;&nbsp; <strong>{testDetails.date}</strong>
              </td>
              <td>
                Duration of test: &nbsp;&nbsp; <strong>{testDetails.duration}</strong> Hrs
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table className="table-bordered" style={{ marginBottom: '25px' }}>
          <thead>
            <tr>
              <th style={{ width: '8%', textAlign: 'center' }}>SI No</th>
              <th style={{ width: '67%', textAlign: 'left' }}>Item</th>
              <th style={{ width: '25%', textAlign: 'center' }}>Assessment</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'item1', label: 'Flight Planning' },
              { id: 'item2', label: 'Precautions before flight' },
              { id: 'item3', label: 'Pre-flight Checks' },
              { id: 'item4', label: 'Take off' },
              { id: 'item5', label: 'General handling' },
              { id: 'item6', label: 'Emergency handling' },
              { id: 'item7', label: 'Landing' },
              { id: 'item8', label: 'Airmanship' },
              { id: 'item9', label: 'Situational awareness' },
              { id: 'item10', label: 'Documentation' }
            ].map((item, index) => {
              const isSat = testDetails[item.id] !== 'Unsat';
              return (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>{item.label}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ position: 'relative' }}>
                      Sat
                      {isSat && <span style={{ position: 'absolute', left: '-5px', top: '0', fontSize: '18px', color: '#000', pointerEvents: 'none' }}>✓</span>}
                    </span>
                    {' / '}
                    <span style={{ position: 'relative' }}>
                      Unsat
                      {!isSat && <span style={{ position: 'absolute', left: '-5px', top: '0', fontSize: '18px', color: '#000', pointerEvents: 'none' }}>✓</span>}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Comments */}
        <div style={{ marginBottom: '80px', lineHeight: '2' }}>
          Comments if any: &nbsp; <strong>{testDetails.comments || 'NIL'}</strong>
          <br/>
          <div style={{ borderBottom: '1px dashed #ccc', marginTop: '10px' }}></div>
          <div style={{ borderBottom: '1px dashed #ccc', marginTop: '20px' }}></div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '50px' }}>
          <div style={{ textAlign: 'center', width: '40%' }}>
            <div style={{ borderBottom: '1px dashed #000', marginBottom: '8px' }}></div>
            Sig of Remote Pilot under Check
          </div>
          <div style={{ textAlign: 'center', width: '40%' }}>
            <div style={{ borderBottom: '1px dashed #000', marginBottom: '8px' }}></div>
            Sig of RPAS Instructor
          </div>
        </div>

      </div>
    </div>
  );
});

export default SkillTestReportPDF;
