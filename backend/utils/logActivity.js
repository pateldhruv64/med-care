import ActivityLog from '../models/ActivityLog.js';

/**
 * Log an activity to the database
 * @param {Object} params
 * @param {string} params.userId - The user who performed the action
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, etc.)
 * @param {string} params.entity - Entity type (Patient, Appointment, etc.)
 * @param {string} params.entityId - ID of the affected entity
 * @param {string} params.details - Human-readable description
 * @param {string} params.ipAddress - IP address of the request
 */
const logActivity = async ({ userId, action, entity, entityId, details, ipAddress }) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            entity,
            entityId,
            details,
            ipAddress: ipAddress || '',
        });
    } catch (error) {
        console.error('Activity Log Error:', error.message);
        // Don't throw - logging should not break the main flow
    }
};

export default logActivity;
