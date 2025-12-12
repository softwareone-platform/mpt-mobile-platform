export interface Auth0ErrorDetails {
    name: string;
    message: string;
    code?: string;
    status?: number;
}

export type Auth0ErrorType =
    | 'INVALID_CODE'
    | 'CODE_EXPIRED'
    | 'EMAIL_NOT_AUTHORIZED'
    | 'TOO_MANY_ATTEMPTS'
    | 'USER_BLOCKED'
    | 'UNKNOWN_ERROR';

export interface ParsedAuth0Error {
    type: Auth0ErrorType;
    translationKey: string;
    originalError: Auth0ErrorDetails;
}

class Auth0ErrorParsingService {
    parseError(error: Error): ParsedAuth0Error {
        const errorDetails = this.extractErrorDetails(error);

        const errorType = this.determineErrorType(errorDetails);

        const translationKey = this.getTranslationKey(errorType);

        return {
            type: errorType,
            translationKey,
            originalError: errorDetails,
        };
    }

    private extractErrorDetails(error: Error): Auth0ErrorDetails {
        const errorAny = error as any;

        const name = error.name !== 'Error' && error.name !== 'unknown_error'
            ? error.name
            : errorAny.code || 'unknown_error';

        const details: Auth0ErrorDetails = {
            name: name,
            message: error.message || 'An unknown error occurred',
            code: errorAny.code || name,
            status: errorAny.status,
        };

        return details;
    }

    private determineErrorType(details: Auth0ErrorDetails): Auth0ErrorType {
        const errorName = details.name?.toLowerCase() || '';
        const errorMessage = details.message?.toLowerCase() || '';

        if (this.isInvalidGrantError(errorName, errorMessage)) {
            return this.getInvalidGrantType(errorMessage);
        }

        if (this.isEmailNotAuthorizedError(errorName, errorMessage, details.status)) {
            return 'EMAIL_NOT_AUTHORIZED';
        }

        if (this.isTooManyAttemptsError(errorName, details.status)) {
            return 'TOO_MANY_ATTEMPTS';
        }

        if (this.isBlockedUserError(errorName)) {
            return 'USER_BLOCKED';
        }

        return 'UNKNOWN_ERROR';
    }

    private isInvalidGrantError(errorName: string, errorMessage: string): boolean {
        return errorName === 'invalid_grant';
    }

    private getInvalidGrantType(errorMessage: string): Auth0ErrorType {
        if (errorMessage.includes('expired')) {
            return 'CODE_EXPIRED';
        }
        return 'INVALID_CODE';
    }

    private isEmailNotAuthorizedError(errorName: string, errorMessage: string, status?: number): boolean {
        return errorName === 'access_denied' || 
               (errorMessage.includes('linking account') && status === 500);
    }

    private isTooManyAttemptsError(errorName: string, status?: number): boolean {
        return errorName === 'too_many_attempts' || status === 429;
    }

    private isBlockedUserError(errorName: string): boolean {
        return errorName === 'blocked_user';
    }

    private getTranslationKey(errorType: Auth0ErrorType): string {
        const translationMap: Record<Auth0ErrorType, string> = {
            INVALID_CODE: 'auth.errors.otpVerificationFailed',
            CODE_EXPIRED: 'auth.errors.otpExpired',
            EMAIL_NOT_AUTHORIZED: 'auth.errors.emailNotAuthorized',
            TOO_MANY_ATTEMPTS: 'auth.errors.tooManyAttempts',
            USER_BLOCKED: 'auth.errors.userBlocked',
            UNKNOWN_ERROR: 'auth.errors.unknownError',
        };

        return translationMap[errorType];
    }

    getTranslationKeyForError(error: Error): string {
        return this.parseError(error).translationKey;
    }

    isErrorType(error: Error, type: Auth0ErrorType): boolean {
        return this.parseError(error).type === type;
    }
}

export const auth0ErrorParsingService = new Auth0ErrorParsingService();
export default auth0ErrorParsingService;
