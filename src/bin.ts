import { validateSqlDate } from "./utils/date";
import { getEnv } from "./utils/env";
import { saveFile } from "./utils/fs";
import { logger } from "./utils/logger";
import { main } from "./main";

(async () => {
    const start = validateSqlDate(getEnv("PROCESS_DATE_START"));
    const finish = process.env.PROCESS_DATE_FINISH
        ? validateSqlDate(getEnv("PROCESS_DATE_FINISH"))
        : undefined;

    logger.info("Start process data for date", start);

    const result = await main({ start, finish });

    logger.info("Got data", result.length + " symbols");

    const lines = result.trim().split("\n");
    const head = lines.slice(0, 1);
    const groups = lines.slice(1).reduce(
        (acc, line) => {
            const date = line.substring(0, 10);
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(line);
            return acc;
        },
        {} as Record<string, string[]>,
    );

    for (const [date, lines] of Object.entries(groups)) {
        saveFile(`build/meters/${date}.csv`, [head, ...lines].join("\n"));
    }

    logger.info(`Data saved to "./build/meters/${start}.csv"`);
})();
