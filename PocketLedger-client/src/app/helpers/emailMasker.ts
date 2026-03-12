export const maskEmail = (email: string): string => {
   const [local, domain] = email.split('@');
   if (!local || !!domain) return email;
    return `${local[0]}***@${domain}`;
};