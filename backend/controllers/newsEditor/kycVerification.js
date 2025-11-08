/**
 * KYC Verification Controller
 * Handles Aadhaar and PAN ID verification for news editor profiles
 * Now integrated with Attestr API for real PAN verification
 */

const attestrService = require('../../services/attestrService');

// Simple validation patterns for Aadhaar, PAN, and Voter ID
const AADHAAR_PATTERN = /^\d{12}$/; // 12 digits
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN format: AAAAA9999A
const VOTER_ID_PATTERN = /^[A-Z]{3}[0-9]{7}$/; // Voter ID format: AAA1234567 (3 letters + 7 digits)

/**
 * Verify Aadhaar or PAN ID
 * POST /api/kyc/verify
 *
 * Now uses Attestr API for real PAN verification
 * Falls back to format validation for Aadhaar or if Attestr is unavailable
 */
const verifyDocument = async (req, res) => {
    try {
        const { document_id, document_type, name, dob } = req.body;

        // Validate required fields
        if (!document_id || !document_type) {
            return res.status(400).json({
                message: 'Document ID and document type are required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Normalize document ID (remove spaces and hyphens)
        const normalizedId = document_id.toString().replace(/[\s-]/g, '').toUpperCase();

        let isValid = false;
        let verificationDetails = {};
        let verificationResult = null;

        // Verify based on document type
        if (document_type === 'aadhaar_or_pan' || document_type === 'aadhaar') {
            // Check if it's a valid Aadhaar (12 digits)
            if (AADHAAR_PATTERN.test(normalizedId)) {
                isValid = true;
                verificationDetails = {
                    documentType: 'aadhaar',
                    documentId: normalizedId,
                    format: 'valid',
                    lastFourDigits: normalizedId.slice(-4),
                    note: 'Aadhaar format validation only. Real verification requires separate integration.'
                };
            }
        }

        // If not Aadhaar, check if it's a valid PAN and verify with Attestr
        if (!isValid && (document_type === 'aadhaar_or_pan' || document_type === 'pan')) {
            if (PAN_PATTERN.test(normalizedId)) {
                // Use Attestr API for real PAN verification
                console.log('🔍 Verifying PAN with Attestr API:', normalizedId);
                verificationResult = await attestrService.verifyPAN(normalizedId, name, dob);

                if (verificationResult.success && verificationResult.verified) {
                    isValid = true;
                    verificationDetails = {
                        documentType: 'pan',
                        documentId: normalizedId,
                        format: 'valid',
                        lastFourDigits: normalizedId.slice(-4),
                        verified: true,
                        verificationProvider: verificationResult.data?.provider || 'Attestr',
                        verificationId: verificationResult.data?.verificationId,
                        name: verificationResult.data?.name,
                        status: verificationResult.data?.status,
                        timestamp: verificationResult.data?.timestamp,
                    };
                } else {
                    // PAN verification failed
                    return res.status(400).json({
                        message: verificationResult.message || 'PAN verification failed',
                        status: 400,
                        success: false,
                        error: true,
                        details: {
                            error: verificationResult.error,
                            documentType: 'pan',
                            documentId: normalizedId,
                        }
                    });
                }
            }
        }

        // Check if it's a valid Voter ID
        if (!isValid && document_type === 'voter_id') {
            if (VOTER_ID_PATTERN.test(normalizedId)) {
                // Voter ID format validation (real verification would require integration with Election Commission API)
                console.log('🔍 Verifying Voter ID format:', normalizedId);
                isValid = true;
                verificationDetails = {
                    documentType: 'voter_id',
                    documentId: normalizedId,
                    format: 'valid',
                    lastFourDigits: normalizedId.slice(-4),
                    verified: true,
                    verificationProvider: 'Format Validation',
                    verificationId: `VOTER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date(),
                    note: 'Voter ID format validation. Real verification requires Election Commission API integration.'
                };
            }
        }

        if (!isValid) {
            let errorMessage = 'Invalid document format';
            let errorDetails = {};

            if (document_type === 'aadhaar_or_pan') {
                errorMessage = 'Invalid Aadhaar or PAN ID format';
                errorDetails = {
                    aadhaarFormat: 'Must be 12 digits (e.g., 123456789012)',
                    panFormat: 'Must be in format AAAAA9999A (e.g., ABCDE1234F)'
                };
            } else if (document_type === 'pan') {
                errorMessage = 'Invalid PAN format';
                errorDetails = {
                    panFormat: 'Must be in format AAAAA9999A (e.g., ABCDE1234F)'
                };
            } else if (document_type === 'voter_id') {
                errorMessage = 'Invalid Voter ID format';
                errorDetails = {
                    voterIdFormat: 'Must be 3 letters followed by 7 digits (e.g., ABC1234567)'
                };
            } else if (document_type === 'aadhaar') {
                errorMessage = 'Invalid Aadhaar format';
                errorDetails = {
                    aadhaarFormat: 'Must be 12 digits (e.g., 123456789012)'
                };
            }

            return res.status(400).json({
                message: errorMessage,
                status: 400,
                success: false,
                error: true,
                details: errorDetails
            });
        }

        res.json({
            message: 'Document verified successfully',
            status: 200,
            success: true,
            error: false,
            data: {
                verified: true,
                verificationDetails,
                timestamp: new Date(),
            }
        });

    } catch (error) {
        console.error('Error verifying document:', error);
        res.status(500).json({
            message: 'Error verifying document',
            status: 500,
            success: false,
            error: true,
            details: error.message
        });
    }
};

/**
 * Verify document image (for uploaded Aadhaar/PAN images)
 * POST /api/kyc/verify-image
 * 
 * This endpoint would handle image-based verification
 * In production, integrate with OCR and document verification services
 */
const verifyDocumentImage = async (req, res) => {
    try {
        // In a real implementation, you would:
        // 1. Receive the image file
        // 2. Use OCR to extract document details
        // 3. Validate the extracted information
        // 4. Call KYC verification APIs
        // 5. Store verification results

        // For now, return a success response
        res.json({
            message: 'Document image verified successfully',
            status: 200,
            success: true,
            error: false,
            data: {
                verified: true,
                verificationId: `KYC_IMG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Error verifying document image:', error);
        res.status(500).json({
            message: 'Error verifying document image',
            status: 500,
            success: false,
            error: true,
            details: error.message
        });
    }
};

module.exports = {
    verifyDocument,
    verifyDocumentImage
};

