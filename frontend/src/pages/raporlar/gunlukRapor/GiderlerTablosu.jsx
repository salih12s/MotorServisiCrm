import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { formatCurrency } from '../raporlarUtils';

const GiderlerTablosu = ({ gunlukRapor }) => {
  if (!gunlukRapor.giderler || gunlukRapor.giderler.length === 0) return null;

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Giderler</Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 500, sm: '100%' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Açıklama</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell align="right">Tutar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gunlukRapor.giderler.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>{g.aciklama}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={g.kategori || 'Genel'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                      {formatCurrency(g.tutar)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default GiderlerTablosu;
