import React from 'react';

const RegistrationFormPDF = React.forwardRef(({ candidate }, ref) => {
  if (!candidate) return null;

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
      <div ref={ref} style={{
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        margin: '0',
        padding: '10mm',
        fontSize: '12px',
        lineHeight: '1.3',
        width: '100%',
        maxWidth: '800px',
        boxSizing: 'border-box'
      }}>
        <style>
          {`
            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; }
            }
          `}
        </style>
        
        {/* Header */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '25px', marginTop: '10px' }}>
          <div style={{ position: 'absolute', top: '0', right: '0', width: '90px', padding: '5px', textAlign: 'center' }}>
            <img src="http://127.0.0.1:5000/uploads/soaring-logo.png" alt="Soaring Logo" style={{ maxWidth: '100%', height: 'auto', marginBottom: '5px' }} onError={(e) => e.target.style.display='none'} />
            {/* <div style={{ fontWeight: 'bold', color: '#1a4d8c', fontSize: '10px' }}>SOARING AEROTECH</div> */}
          </div>
          <br></br>
          <br></br>
          <br></br>
          <h1 style={{ fontSize: '20px', margin: '0', fontWeight: 'bold' }}>Remote Pilot Training Course</h1>
          <h2 style={{ fontSize: '18px', margin: '5px 0 0 0', fontWeight: 'bold' }}>Registration Form</h2>
        </div>

        {/* Candidate Information Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>
                CANDIDATE INFORMATION
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Full Name (as per Class 10th Certificate):', candidate.fullName],
              ['Permanent Address:', candidate.permanentAddress],
              ['Phone number:', candidate.phoneNumber],
              ['Email Address:', candidate.emailAddress],
              ['Maximum Qualification:', candidate.maximumQualification],
              ['Date of Birth:', candidate.dateOfBirth],
              ['Aadhar Number:', candidate.aadharNumber],
              ['P,R,D,V/ Secondary ID Number', candidate.secondaryIdNumber],
              ['Organization Name/ Individual:', candidate.organizationOrIndividual]
            ].map(([label, val], idx) => (
              <tr key={idx}>
                <td style={{ width: '35%', fontWeight: 'normal', border: '1px solid #000', padding: '6px 8px' }}>{label}</td>
                <td style={{ width: '65%', fontWeight: 'bold', border: '1px solid #000', padding: '6px 8px' }}>{val || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Checklist Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>
                CHECKLIST (FOR OFFICIAL USE ONLY - DO NOT FILL)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'inline-block', marginRight: '6px', textAlign: 'center', lineHeight: '12px', fontSize: '14px' }}>
                  {candidate.check4Photographs ? '✓' : ''}
                </span> 4 Photographs
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'inline-block', marginRight: '6px', textAlign: 'center', lineHeight: '12px', fontSize: '14px' }}>
                  {candidate.check10thCertificate ? '✓' : ''}
                </span> Original 10<sup>th</sup> Passing Certificate/Marksheet
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'inline-block', marginRight: '6px', textAlign: 'center', lineHeight: '12px', fontSize: '14px' }}>
                  {candidate.checkAadhar ? '✓' : ''}
                </span> Original ID Proof: Aadhar
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                {['Passport', 'Voter ID', 'Driving License', 'Ration Card'].map(type => (
                  <span key={type} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '15px' }}>
                    <span style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'inline-block', marginRight: '6px', textAlign: 'center', lineHeight: '12px', fontSize: '14px' }}>
                      {candidate.checkSecondaryIdType === type ? '✓' : ''}
                    </span> {type}
                  </span>
                ))}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'inline-block', marginRight: '6px', textAlign: 'center', lineHeight: '12px', fontSize: '14px' }}>
                  {candidate.checkSelfAttested ? '✓' : ''}
                </span> Self-Attested Copy of all the above documents
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'inline-block', marginRight: '6px', textAlign: 'center', lineHeight: '12px', fontSize: '14px' }}>
                  {candidate.checkMedicalFitness ? '✓' : ''}
                </span> Certificate of Medical Fitness
              </td>
            </tr>
          </tbody>
        </table>

        {/* Declaration Section */}
        <div style={{ marginTop: '15px', textAlign: 'justify', fontSize: '15px', lineHeight: '1.4' }}>
          I, Mr./Mrs./Ms. <strong>{candidate.fullName}</strong> hereby declare that the above information is completely true, and I understand that any misinformation can lead to legal actions against me. I also hereby declare that I will handle the Drone and Drone-related equipment as instructed and will follow the SOPs as mentioned by the Drone instructor. Further, I understand that any kind of misbehavior or violation of Code of Conduct may lead to immediate cancellation from the training program.
        </div>

        {/* Signatures Footer */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '12px' }}>
          <div>
            <p style={{ margin: '5px 0' }}>Place of Signing: <strong>______________________</strong></p>
        <br></br>
        <br></br>

            <p style={{ margin: '5px 0' }}>Signature: ______________________</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '5px 0' }}>Date: <strong>______________________</strong></p>
          </div>
        </div>

        {/* Company Footer */}
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
    
    

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px', fontStyle: 'italic', paddingTop: '8px' }}>
          Soaring Aerotech Pvt Ltd / info@soaringaerotech.com / www.soaringaerotech.com
        </div>
      </div>
    </div>
  );
});

export default RegistrationFormPDF;
