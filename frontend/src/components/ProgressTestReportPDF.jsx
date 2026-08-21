import React from 'react';
import logo from "../assets/soaring-logo.png";

const ProgressTestReportPDF = React.forwardRef(({ candidate, testDetails }, ref) => {
  if (!candidate || !testDetails) return null;


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
              <th colSpan="3" style={{ textAlign: 'center', width: '58%' }}>Aspect of knowledge / skill / attitude</th>
              <th style={{ textAlign: 'center', width: '21%' }}>Assessment</th>
              <th style={{ textAlign: 'center', width: '21%' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="4" style={{ width: '15%', verticalAlign: 'top' }}>Prerequisite<br/>knowledge<br/>before<br/>Progress Test</td>
              <td style={{ textAlign: 'center', width: '5%' }}>1</td>
              <td style={{ width: '38%' }}>Knowledge of control</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item1_1'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>2</td>
              <td>Pre-Flight Checklist</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item1_2'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>3</td>
              <td>Pre-Flight Inspection</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item1_3'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>4</td>
              <td>Flight Planning</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item1_4'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            
            <tr>
              <td colSpan="5" style={{ height: '20px', backgroundColor: '#f9f9f9' }}></td>
            </tr>

            <tr>
              <td rowSpan="5" style={{ verticalAlign: 'top' }}>Performance<br/>during the<br/>test</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>Takeoff and Landing</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item2_1'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>2</td>
              <td>Basic Control</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item2_2'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>3</td>
              <td>Climb and Descent</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item2_3'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>4</td>
              <td>Pitch, Roll and Yaw</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item2_4'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>5</td>
              <td>Flying in Disorientation & Recovery</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item2_5'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>

            <tr>
              <td colSpan="5" style={{ height: '20px', backgroundColor: '#f9f9f9' }}></td>
            </tr>

            <tr>
              <td rowSpan="1">Technique</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>Situational Awareness</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item3_1'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>

            <tr>
              <td colSpan="5" style={{ height: '20px', backgroundColor: '#f9f9f9' }}></td>
            </tr>

            <tr>
              <td rowSpan="1">Attitude</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>Airmanship</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{testDetails['item4_1'] !== 'Unsat' ? 'Sat' : 'Unsat'}</td>
              <td></td>
            </tr>

            <tr>
              <td colSpan="5" style={{ height: '20px', backgroundColor: '#f9f9f9' }}></td>
            </tr>

            <tr>
              <td colSpan="3" style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '20px' }}>Overall Progress</td>
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
