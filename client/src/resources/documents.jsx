// import * as React from "react";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
export const DocumentsIcon = LocalPrintshopIcon;

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { DocumentsAllVedomostButton } from "../components/DocumentsAllVedomost";
import { useTranslate } from 'react-admin';






export const DocumentsList = () => {
  const translate = useTranslate();
  const card = (
    <React.Fragment>
      <CardContent>
        <Typography variant="h5" component="div">
          {translate('documents.allVedomost.name')}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {translate('documents.allVedomost.type')}
        </Typography>
        <Typography variant="body2">
          {translate('documents.allVedomost.comment')}
        </Typography>
      </CardContent>
      <CardActions>
        <DocumentsAllVedomostButton />
      </CardActions>
    </React.Fragment>
  );
  return (
    <Box sx={{ minWidth: 250 , mt: 1.5, width: 300, display: 'flex'}}>
      <Card variant="outlined" sx={{mr: 2, ml: 2}}>{card}</Card>
    </Box>
)};
