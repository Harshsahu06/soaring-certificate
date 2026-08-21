import React from 'react';
import logo from "../assets/soaring-logo.png";

const ProgressTestReportPDF = React.forwardRef(({ candidate, testDetails }, ref) => {
  if (!candidate || !testDetails) return null;

  const renderItem = (label, id, index) => {
    const isSat = testDetails[id] !== 'Unsat';
    return (
      <tr key={id}>
        <td style={{ textAlign: 'center', width: '8%' }}>{index + 1}</td>
        <td style={{ width: '50%' }}>{label}</td>
        <td style={{ textAlign: 'center', width: '21%', fontWeight: 'bold' }}>
          {isSat ? 'Sat' : 'Unsat'}
        </td>
        <td style={{ width: '21%' }}></td>
      </tr>
    );
  };

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      <div ref={ref} className="progress-report-wrapper" style={{
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        margin: '0',
        padding: '30px 40px',
        fontSize: '13px',
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
              .progress-report-wrapper { page-break-inside: avoid; padding: 20mm 20mm 15mm 20mm; box-sizing: border-box; }
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
          PROGRESS TEST REPORT: RPAS
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
                Date of the progress test: &nbsp;&nbsp; <strong>{testDetails.date}</strong>
              </td>
              <td style={{ width: '50%' }}>
                Type of test: <strong>{testDetails.type}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table className="table-bordered" style={{ marginBottom: '25px' }}>
          <thead>
            <tr>
              <th colSpan="2" style={{ textAlign: 'center', width: '58%' }}>Aspect of knowledge / skill / attitude</th>
              <th style={{ textAlign: 'center', width: '21%' }}>Assessment</th>
              <th style={{ textAlign: 'center', width: '21%' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {/* Group 1 */}
            <tr>
              <td rowSpan="4" style={{ width: '15%', verticalAlign: 'top' }}>Prerequisite<br/>knowledge<br/>before<br/>Progress Test</td>
              <td style={{ padding: 0, border: 0 }} colSpan="3">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {renderItem('Knowledge of control', 'item1_1', 0)}
                    {renderItem('Pre-Flight Checklist', 'item1_2', 1)}
                    {renderItem('Pre-Flight Inspection', 'item1_3', 2)}
                    {renderItem('Flight Planning', 'item1_4', 3)}
                  </tbody>
                </table>
              </td>
            </tr>
            
            {/* Empty separator row */}
            <tr>
              <td colSpan="4" style={{ height: '20px', backgroundColor: '#f9f9f9' }}></td>
            </tr>

            {/* Group 2 */}
            <tr>
              <td rowSpan="5" style={{ width: '15%', verticalAlign: 'top' }}>Performance<br/>during the<br/>test</td>
              <td style={{ padding: 0, border: 0 }} colSpan="3">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {renderItem('Takeoff and Landing', 'item2_1', 0)}
                    {renderItem('Basic Control', 'item2_2', 1)}
                    {renderItem('Climb and Descent', 'item2_3', 2)}
                    {renderItem('Pitch, Roll and Yaw', 'item2_4', 3)}
                    {renderItem('Flying in Disorientation & Recovery', 'item2_5', 4)}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Group 3 */}
            <tr>
              <td style={{ width: '15%' }}>Technique</td>
              <td style={{ padding: 0, border: 0 }} colSpan="3">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {renderItem('Situational Awareness', 'item3_1', 0)}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Group 4 */}
            <tr>
              <td style={{ width: '15%' }}>Attitude</td>
              <td style={{ padding: 0, border: 0 }} colSpan="3">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {renderItem('Airmanship', 'item4_1', 0)}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Overall Progress */}
            <tr>
              <td colSpan="2" style={{ fontWeight: 'bold' }}>Overall Progress</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                {testDetails['overall'] !== 'Unsat' ? 'Sat' : 'Unsat'}
              </td>
              <td></td>
            </tr>
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
            Sign of RPAS Instructor
          </div>
        </div>

      </div>
    </div>
  );
});

export default ProgressTestReportPDF;
