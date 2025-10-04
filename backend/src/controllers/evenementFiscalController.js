const prisma = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllEvenements = asyncHandler(async (req, res) => {
  const evenements = await prisma.evenementFiscal.findMany({
    include: { bien: { select: { id: true, adresse: true, ville: true } } },
    orderBy: { dateEcheance: 'asc' },
  });
  res.status(200).json({ success: true, count: evenements.length, data: evenements });
});

exports.getEvenementsByBien = asyncHandler(async (req, res) => {
  const { bienId } = req.params;
  const evenements = await prisma.evenementFiscal.findMany({
    where: { bienId },
    orderBy: { dateEcheance: 'asc' },
  });
  res.status(200).json({ success: true, count: evenements.length, data: evenements });
});

exports.getEvenementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const evenement = await prisma.evenementFiscal.findUnique({
    where: { id },
    include: { bien: true },
  });
  if (!evenement) {
    return res.status(404).json({ success: false, error: 'Événement non trouvé' });
  }
  res.status(200).json({ success: true, data: evenement });
});

exports.createEvenement = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.type || !data.dateEcheance || !data.bienId) {
    return res.status(400).json({ success: false, error: 'Champs requis manquants' });
  }
  const dataToCreate = { ...data };
  dataToCreate.dateEcheance = new Date(dataToCreate.dateEcheance);
  if (dataToCreate.datePaiement) dataToCreate.datePaiement = new Date(dataToCreate.datePaiement);
  if (dataToCreate.montant) dataToCreate.montant = parseFloat(dataToCreate.montant);
  if (dataToCreate.estPaye === undefined) dataToCreate.estPaye = false;
  
  const evenement = await prisma.evenementFiscal.create({
    data: dataToCreate,
    include: { bien: true },
  });
  res.status(201).json({ success: true, data: evenement });
});

exports.updateEvenement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const evenementExistant = await prisma.evenementFiscal.findUnique({ where: { id } });
  if (!evenementExistant) {
    return res.status(404).json({ success: false, error: 'Événement non trouvé' });
  }
  const dataToUpdate = { ...data };
  if (dataToUpdate.dateEcheance) dataToUpdate.dateEcheance = new Date(dataToUpdate.dateEcheance);
  if (dataToUpdate.datePaiement) dataToUpdate.datePaiement = new Date(dataToUpdate.datePaiement);
  if (dataToUpdate.montant) dataToUpdate.montant = parseFloat(dataToUpdate.montant);
  delete dataToUpdate.bienId;
  delete dataToUpdate.id;
  delete dataToUpdate.createdAt;
  delete dataToUpdate.updatedAt;
  
  const evenement = await prisma.evenementFiscal.update({
    where: { id },
    data: dataToUpdate,
    include: { bien: true },
  });
  res.status(200).json({ success: true, data: evenement });
});

exports.deleteEvenement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const evenement = await prisma.evenementFiscal.findUnique({ where: { id } });
  if (!evenement) {
    return res.status(404).json({ success: false, error: 'Événement non trouvé' });
  }
  await prisma.evenementFiscal.delete({ where: { id } });
  res.status(200).json({ success: true, data: {}, message: 'Événement supprimé' });
});