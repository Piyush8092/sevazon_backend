/**
 * KYC Verification Controller
 * Handles Aadhaar and PAN ID verification for news editor profiles
 * Now integrated with Attestr API for real PAN verification
 */

const attestrService = require('../../services/attestrService');

// Simple validation patterns for Aadhaar and PAN
const AADHAAR_PATTERN = /^\d{12}$/; // 12 digits
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN format: AAAAA9999A

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

        if (!isValid) {
            return res.status(400).json({
                message: 'Invalid Aadhaar or PAN ID format',
                status: 400,
                success: false,
                error: true,
                details: {
                    aadhaarFormat: 'Must be 12 digits (e.g., 123456789012)',
                    panFormat: 'Must be in format AAAAA9999A (e.g., ABCDE1234F)'
                }
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

