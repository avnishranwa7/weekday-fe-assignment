import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid } from "@mui/material";

// local imports
import classes from "./App.module.css";
import JobPost from "./components/JobPost";
import { JobData } from "./components/JobPost/types";
import LoadingCard from "./components/LoadingCard";
import Filters from "./components/Filters";

function getGridColumns() {
  const width = window.innerWidth;
  if (width < 600) return 1;
  if (width < 900) return 2;
  if (width < 1200) return 3;

  return 4;
}

// limit for API
const limit = getGridColumns() * 4;
async function getJobData(offset: number) {
  return fetch("https://api.weekday.technology/adhoc/getSampleJdJSON", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      limit,
      offset,
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });
}

const breakPoints = { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };

function App() {
  const [jobData, setJobData] = useState<Array<JobData>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // fetches new data and append to existing data
  const loadData = useCallback(async () => {
    setLoading(true);
    const newData = await getJobData(jobData.length);
    setLoading(false);
    setJobData((prev) => [...prev, ...newData.jdList]);
  }, [jobData.length]);

  // fetch more data when reached the end
  const handleReachEnd = useCallback(() => {
    if (
      document.documentElement.clientHeight + window.scrollY >=
      (document.documentElement.scrollHeight ||
        document.documentElement.clientHeight)
    )
      loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleReachEnd);
    return () => window.removeEventListener("scroll", handleReachEnd);
  }, [handleReachEnd, loadData]);

  const roles = useMemo(
    () => Array.from(new Set(jobData.map((job) => job.jobRole))),
    [jobData]
  );

  return (
    <div className={classes.root}>
      <Filters roles={roles} />
      <Grid container columnSpacing={1} rowSpacing={5}>
        {jobData.map((job) => (
          <Grid
            key={job.jdUid}
            item
            {...breakPoints}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <JobPost jobData={job} />
          </Grid>
        ))}
      </Grid>
      {loading && <LoadingCard />}
    </div>
  );
}

export default App;
