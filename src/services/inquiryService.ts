import connectToDatabase from '@/lib/mongodb';
import Inquiry, { IInquiryDocument } from '@/models/Inquiry';
import { IInquiry } from '@/types';
import { sampleInquiries } from '@/lib/mockData';

let inMemoryInquiries: IInquiry[] = [...sampleInquiries];

function documentToInquiry(doc: any): IInquiry {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: obj._id ? obj._id.toString() : obj.id,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
}

export async function createInquiry(data: Partial<IInquiry>): Promise<IInquiry> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await Inquiry.create(data);
      const saved = documentToInquiry(doc);
      inMemoryInquiries.unshift(saved);
      return saved;
    }
  } catch (err) {
    console.error('Error creating inquiry in DB:', err);
  }

  const newInq: IInquiry = {
    id: `inq-${Date.now()}`,
    _id: `inq-${Date.now()}`,
    name: data.name || 'Anonymous Client',
    phone: data.phone || '',
    email: data.email || '',
    product: data.product || '',
    productId: data.productId || '',
    productSku: data.productSku || '',
    message: data.message || '',
    status: 'new',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };

  inMemoryInquiries.unshift(newInq);
  return newInq;
}

export async function getInquiries(
  limit = 20,
  page = 1,
  status?: string
): Promise<{ items: IInquiry[]; total: number; unreadCount: number }> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      const skip = (page - 1) * limit;
      const total = await Inquiry.countDocuments(query);
      const unreadCount = await Inquiry.countDocuments({ status: 'new' });
      const docs = await Inquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      if (total > 0) {
        return {
          items: docs.map((d: any) => ({
            ...d,
            id: d._id.toString(),
            _id: d._id.toString(),
          })),
          total,
          unreadCount,
        };
      }
    }
  } catch (err) {
    console.warn('Inquiry query error, falling back:', err);
  }

  let items = [...inMemoryInquiries];
  if (status && status !== 'all') {
    items = items.filter((i) => i.status === status);
  }

  const unreadCount = inMemoryInquiries.filter((i) => i.status === 'new').length;
  const paginated = items.slice((page - 1) * limit, page * limit);

  return {
    items: paginated,
    total: items.length,
    unreadCount,
  };
}

export async function updateInquiryStatus(
  id: string,
  status: 'new' | 'contacted' | 'converted' | 'closed',
  notes?: string
): Promise<IInquiry | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const updateData: any = { status };
      if (notes !== undefined) updateData.notes = notes;
      const doc = await Inquiry.findByIdAndUpdate(id, updateData, { new: true });
      if (doc) {
        const updated = documentToInquiry(doc);
        inMemoryInquiries = inMemoryInquiries.map((i) => (i.id === id || i._id === id ? updated : i));
        return updated;
      }
    }
  } catch (err) {
    console.error('Error updating inquiry status:', err);
  }

  const idx = inMemoryInquiries.findIndex((i) => i.id === id || i._id === id);
  if (idx !== -1) {
    inMemoryInquiries[idx] = {
      ...inMemoryInquiries[idx],
      status,
      notes: notes !== undefined ? notes : inMemoryInquiries[idx].notes,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryInquiries[idx];
  }
  return null;
}
