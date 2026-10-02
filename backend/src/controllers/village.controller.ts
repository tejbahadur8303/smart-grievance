import { Request, Response } from 'express';
import { District, Block, Panchayat, Village } from '../models/location.model';
import { Department } from '../models/department.model';

export class VillageController {
  static async listDistricts(req: Request, res: Response): Promise<void> {
    try {
      const districts = await District.find().sort({ name: 1 });
      res.status(200).json({ success: true, data: districts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listBlocks(req: Request, res: Response): Promise<void> {
    try {
      const districtId = req.query.districtId as string;
      const filter = districtId ? { districtId } : {};
      const blocks = await Block.find(filter).sort({ name: 1 });
      res.status(200).json({ success: true, data: blocks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listPanchayats(req: Request, res: Response): Promise<void> {
    try {
      const blockId = req.query.blockId as string;
      const filter = blockId ? { blockId } : {};
      const panchayats = await Panchayat.find(filter).sort({ name: 1 });
      res.status(200).json({ success: true, data: panchayats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listVillages(req: Request, res: Response): Promise<void> {
    try {
      const panchayatId = req.query.panchayatId as string;
      const filter = panchayatId ? { panchayatId } : {};
      const villages = await Village.find(filter).sort({ name: 1 });
      res.status(200).json({ success: true, data: villages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await Department.find({ isActive: true }).sort({ name: 1 });
      res.status(200).json({ success: true, data: departments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Returns rural emergency numbers & nearby government service points
  static async getNearbyServices(req: Request, res: Response): Promise<void> {
    const services = [
      {
        category: 'Emergency Services (24x7)',
        items: [
          { name: 'National Emergency Helpline', phone: '112', description: 'Immediate Police / Ambulance / Fire response' },
          { name: 'Ambulance (Swasthya Sewa)', phone: '108', description: 'Rural Medical Emergency Ambulance' },
          { name: 'Women Helpline (Mahila Helpline)', phone: '1090', description: 'Assistance & safety for women' },
          { name: 'Child Helpline', phone: '1098', description: 'Child protection & grievance redressal' },
          { name: 'Electricity Faults / Discom', phone: '1912', description: 'Immediate electrical hazard / fallen wire helpline' }
        ]
      },
      {
        category: 'Village Civic Infrastructure',
        items: [
          { name: 'Gram Panchayat Bhawan', phone: '+91-98765-43210', description: 'Panchayat Sachiv & Pradhan office' },
          { name: 'Primary Health Centre (PHC)', phone: '+91-98765-43211', description: 'Doctors & free rural medicine center' },
          { name: 'Fair Price Ration Shop (FPS)', phone: '+91-98765-43212', description: 'PDS subsidized grains distribution point' },
          { name: 'Jal Sansthan Pump Operator', phone: '+91-98765-43213', description: 'Drinking water pipeline & handpump maintenance' }
        ]
      }
    ];

    res.status(200).json({ success: true, data: services });
  }
}
