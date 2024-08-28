export function validateSqlDate(date: string): string {
    const datePattern = /^(\d{4})\-(\d{2})\-(\d{2})$/;
    if (!datePattern.test(date)) {
        throw new Error("Invalid date format");
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date");
    }

    return date;
}
